import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plane, Trash2, Plus, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface ControlEntry {
  id: string;
  crash_point: number;
  status: string;
  position: number;
  created_at: string;
  consumed_at?: string | null;
  actual_crash?: number | null;
  round_id?: number | null;
}

const AviatorControlPanel = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<ControlEntry[]>([]);
  const [history, setHistory] = useState<ControlEntry[]>([]);
  const [roundIdInput, setRoundIdInput] = useState("");
  const [crashInput, setCrashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
  const [currentRoundStatus, setCurrentRoundStatus] = useState<"active" | "next" | "idle">("idle");
  const retryRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    const { data: pending } = await supabase
      .from("aviator_admin_controls")
      .select("*")
      .eq("status", "pending")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    setQueue((pending as any) || []);

    const { data: consumed } = await supabase
      .from("aviator_admin_controls")
      .select("*")
      .eq("status", "consumed")
      .order("created_at", { ascending: false })
      .limit(20);
    setHistory((consumed as any) || []);

    const { data: active } = await supabase
      .from("aviator_admin_controls")
      .select("round_id")
      .eq("status", "consumed")
      .is("actual_crash", null)
      .order("consumed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (active && (active as any).round_id) {
      setCurrentRoundId(Number((active as any).round_id));
      setCurrentRoundStatus("active");
    } else if (pending && pending.length > 0 && (pending[0] as any).round_id) {
      setCurrentRoundId(Number((pending[0] as any).round_id));
      setCurrentRoundStatus("next");
    } else {
      const { data: seqId } = await supabase.rpc("admin_peek_next_aviator_round_id");
      if (seqId != null) {
        setCurrentRoundId(Number(seqId));
        setCurrentRoundStatus("next");
      } else {
        setCurrentRoundId(null);
        setCurrentRoundStatus("idle");
      }
    }
  };

  const manualRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
    toast.success("Queue refreshed");
  };

  useEffect(() => {
    load();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const startPolling = () => {
      if (pollTimerRef.current) return;
      pollTimerRef.current = setInterval(load, 5000);
    };
    const stopPolling = () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    const connect = () => {
      setRealtimeStatus("connecting");
      channel = supabase
        .channel(`aviator-controls-${Date.now()}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "aviator_admin_controls" }, load)
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setRealtimeStatus("live");
            retryRef.current = 0;
            stopPolling();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setRealtimeStatus("offline");
            startPolling();
            const delay = Math.min(1000 * 2 ** retryRef.current, 30_000);
            retryRef.current += 1;
            const oldChannel = channel;
            channel = null;
            if (oldChannel) supabase.removeChannel(oldChannel);
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            retryTimerRef.current = setTimeout(connect, delay);
          }
        });
    };
    connect();
    return () => {
      if (channel) supabase.removeChannel(channel);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      stopPolling();
    };
  }, []);

  const addPoints = async () => {
    if (!user) return;
    const crash = parseFloat(crashInput);
    const roundId = parseInt(roundIdInput, 10);
    if (isNaN(crash) || crash < 1) {
      toast.error("Enter a valid crash point (≥ 1.00)");
      return;
    }
    if (isNaN(roundId) || roundId < 1) {
      toast.error("Enter a valid Round ID");
      return;
    }
    setLoading(true);
    const row: any = {
      crash_point: crash,
      round_id: roundId,
      set_by: user.id,
      position: queue.length,
      status: "pending",
    };
    const { error } = await supabase.from("aviator_admin_controls").insert([row]);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(`Round ${roundId} will crash at ${crash.toFixed(2)}x`);
    setRoundIdInput("");
    setCrashInput("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("aviator_admin_controls").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  const clearAll = async () => {
    const { error } = await supabase.from("aviator_admin_controls").delete().eq("status", "pending");
    if (error) return toast.error(error.message);
    toast.success("Queue cleared");
    load();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 flex-wrap">
        <Plane className="w-7 h-7 text-red-500" />
        <div className="flex-1 min-w-[180px]">
          <h1 className="text-2xl font-bold">Aviator Control</h1>
          <p className="text-sm text-muted-foreground">
            Pre-set the next crash points. The plane will fly until each value, in order.
          </p>
        </div>
        {currentRoundId != null && (
          <div
            className={`flex flex-col items-end px-3 py-1.5 rounded-lg border ${
              currentRoundStatus === "active"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-blue-500/10 border-blue-500/30"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {currentRoundStatus === "active" ? "🔴 Active Round" : "⏳ Next Round"}
            </span>
            <span className="text-lg font-black font-mono leading-none">{currentRoundId}</span>
          </div>
        )}
        <span
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
            realtimeStatus === "live"
              ? "bg-green-500/10 text-green-500 border-green-500/30"
              : realtimeStatus === "connecting"
              ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
              : "bg-red-500/10 text-red-500 border-red-500/30"
          }`}
        >
          {realtimeStatus === "live" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {realtimeStatus === "live" ? "Live" : realtimeStatus === "connecting" ? "Connecting" : "Polling"}
        </span>
        <Button variant="outline" size="sm" onClick={manualRefresh} disabled={refreshing} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-b from-rose-50 to-white border-rose-200">
        <div className="flex flex-col items-center text-center">
          <div className="inline-block bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-bold text-[11px] px-3 py-1 rounded-full shadow mb-2">
            Premium Predictor
          </div>
          <h2 className="text-2xl font-black text-red-600 flex items-center gap-2">
            <Plane className="w-5 h-5 -rotate-45" />
            Next Aviator Crash
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            This is the exact value the plane will crash at on the next round.
          </p>
          <div
            className="relative w-56 h-56 rounded-full bg-white flex items-center justify-center mt-5"
            style={{
              boxShadow:
                "0 0 0 6px #fff, 0 0 30px 10px rgba(239,68,68,0.45), 0 0 80px 20px rgba(239,68,68,0.2)",
            }}
          >
            {queue.length === 0 ? (
              <div className="text-center px-4">
                <div className="text-3xl font-black text-gray-400">--</div>
                <div className="text-[11px] text-gray-500 mt-1 max-w-[10rem]">
                  Queue empty — next round will be random. Add a crash point below.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full mb-1 font-mono">
                  Round ID: {queue[0].round_id ?? "—"}
                </div>
                <div className={`text-5xl font-black ${queue[0].crash_point >= 2 ? "text-green-600" : "text-red-600"}`}>
                  {Number(queue[0].crash_point).toFixed(2)}x
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Position #1 of {queue.length}
                </div>
              </div>
            )}
          </div>
          <div className="mt-5 w-full bg-green-50 border-l-4 border-green-500 rounded-md px-3 py-2 text-left text-xs text-gray-700">
            <span className="font-bold">Note:</span> This value is locked — the Aviator game will crash at exactly this multiplier.
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h2 className="font-semibold">Set crash point for a specific Round ID</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Round ID</label>
            <Input
              placeholder="e.g. 77234555"
              value={roundIdInput}
              inputMode="numeric"
              onChange={(e) => setRoundIdInput(e.target.value.replace(/[^0-9]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && addPoints()}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Crash Point (x)</label>
            <Input
              placeholder="e.g. 10.6"
              value={crashInput}
              inputMode="decimal"
              onChange={(e) => setCrashInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPoints()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addPoints} disabled={loading} className="gap-2 w-full">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the exact Round ID you want to control and the crash multiplier. When the game reaches that round, the plane will crash at exactly that value.
        </p>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Pending queue ({queue.length})</h2>
          {queue.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </div>
        {queue.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No pending crash points — the game will use random values.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Round ID</TableHead>
                <TableHead>Crash Point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.map((q, i) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      #{i + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{q.round_id ?? "—"}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${q.crash_point >= 2 ? "text-green-500" : "text-red-500"}`}>
                      {Number(q.crash_point).toFixed(2)}x
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      i === 0
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                    }`}>
                      {i === 0 ? "Next Up" : "Queued"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(q.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => remove(q.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Verification Log (last 20 rounds)</h2>
          {(() => {
            const verified = history.filter((h) => h.actual_crash != null);
            const matches = verified.filter(
              (h) => Math.abs(Number(h.crash_point) - Number(h.actual_crash)) < 0.01
            ).length;
            return verified.length > 0 ? (
              <span className="text-xs text-muted-foreground">{matches}/{verified.length} matched</span>
            ) : null;
          })()}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No history yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Predicted</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => {
                const predicted = Number(h.crash_point);
                const actual = h.actual_crash != null ? Number(h.actual_crash) : null;
                const matched = actual != null && Math.abs(predicted - actual) < 0.01;
                return (
                  <TableRow key={h.id}>
                    <TableCell><span className="font-bold">{predicted.toFixed(2)}x</span></TableCell>
                    <TableCell>
                      {actual == null ? (
                        <span className="text-xs text-muted-foreground">pending…</span>
                      ) : (
                        <span className={`font-bold ${matched ? "text-green-500" : "text-red-500"}`}>{actual.toFixed(2)}x</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {actual == null ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">—</span>
                      ) : matched ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/30 font-semibold">✓ MATCH</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/30 font-semibold">✗ MISMATCH</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {h.consumed_at ? new Date(h.consumed_at).toLocaleTimeString() : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default AviatorControlPanel;
