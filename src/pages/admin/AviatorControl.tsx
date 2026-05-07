import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
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
}

const AviatorControl = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<ControlEntry[]>([]);
  const [history, setHistory] = useState<ControlEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("aviator-controls")
      .on("postgres_changes", { event: "*", schema: "public", table: "aviator_admin_controls" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const addPoints = async () => {
    if (!user) return;
    const parts = input
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n) && n >= 1);

    if (parts.length === 0) {
      toast.error("Enter valid multipliers (e.g. 1.7, 3, 2)");
      return;
    }

    setLoading(true);
    const startPos = queue.length;
    const rows = parts.map((p, i) => ({
      crash_point: p,
      set_by: user.id,
      position: startPos + i,
      status: "pending",
    }));

    const { error } = await supabase.from("aviator_admin_controls").insert(rows);
    setLoading(false);

    if (error) return toast.error(error.message);
    toast.success(`Added ${parts.length} crash point${parts.length > 1 ? "s" : ""}`);
    setInput("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("aviator_admin_controls").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  const clearAll = async () => {
    const { error } = await supabase
      .from("aviator_admin_controls")
      .delete()
      .eq("status", "pending");
    if (error) return toast.error(error.message);
    toast.success("Queue cleared");
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Plane className="w-7 h-7 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold">Aviator Control</h1>
            <p className="text-sm text-muted-foreground">
              Pre-set the next crash points. The plane will fly until each value, in order.
            </p>
          </div>
        </div>

        <Card className="p-5 bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
          <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Next Up</h2>
          {queue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No queued crash point — next round will be random.</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-black ${queue[0].crash_point >= 2 ? "text-green-500" : "text-red-500"}`}>
                {Number(queue[0].crash_point).toFixed(2)}x
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Position <span className="font-bold text-foreground">#1</span> of {queue.length}</div>
                <div className="text-xs">Will be used on the next round</div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-semibold">Add crash points</h2>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 1.7, 3, 2, 1.25, 5.5"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPoints()}
            />
            <Button onClick={addPoints} disabled={loading} className="gap-2">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Separate values with commas or spaces. Min 1.00. Each round consumes the next value in the queue.
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
          <h2 className="font-semibold mb-3">Recent consumed (last 20)</h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No history yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {history.map((h) => (
                <span
                  key={h.id}
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    h.crash_point >= 2
                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                      : "bg-red-500/10 text-red-500 border-red-500/30"
                  }`}
                >
                  {Number(h.crash_point).toFixed(2)}x
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AviatorControl;
