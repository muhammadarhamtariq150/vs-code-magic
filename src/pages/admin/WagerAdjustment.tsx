import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Search, ArrowDownUp, Plus, Minus } from "lucide-react";

const WagerAdjustment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ user_id: string; username: string } | null>(null);
  const [wagerTracking, setWagerTracking] = useState<any[]>([]);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<"add" | "reduce">("reduce");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchUser = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const { data: profile } = await supabase.from("profiles").select("user_id, username").ilike("username", `%${searchQuery}%`).single();
      if (!profile) { toast({ title: "User not found", variant: "destructive" }); setLoading(false); return; }
      setSelectedUser(profile);

      const { data: wagers } = await supabase.from("wager_tracking").select("*").eq("user_id", profile.user_id).order("created_at", { ascending: false });
      setWagerTracking(wagers || []);
    } catch (error: any) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const adjustWager = async (wagerId: string) => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) { toast({ title: "Invalid amount", variant: "destructive" }); return; }
    
    const wager = wagerTracking.find((w) => w.id === wagerId);
    if (!wager) return;

    const newRequired = adjustType === "add" ? Number(wager.turnover_required) + amount : Math.max(0, Number(wager.turnover_required) - amount);

    try {
      await supabase.from("wager_tracking").update({ turnover_required: newRequired, is_fulfilled: wager.turnover_completed >= newRequired }).eq("id", wagerId);
      setWagerTracking((prev) => prev.map((w) => w.id === wagerId ? { ...w, turnover_required: newRequired, is_fulfilled: w.turnover_completed >= newRequired } : w));
      toast({ title: "Wager adjusted" });
      setAdjustAmount("");
    } catch (error: any) {
      toast({ title: "Adjustment failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Wager Adjustment</h1>
          <p className="text-muted-foreground">Manage turnover/wager requirements. 1x wager auto-applied on deposits.</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Search className="w-5 h-5" />Find Member</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Enter username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchUser()} />
              <Button onClick={searchUser} disabled={loading}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {selectedUser && wagerTracking.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ArrowDownUp className="w-5 h-5" />Wager Tracking for {selectedUser.username}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {wagerTracking.map((wager) => (
                <div key={wager.id} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">{wager.deposit_id ? "Deposit Wager" : "Bonus Wager"}</p>
                      <p className="font-medium">Required: ₹{Number(wager.turnover_required).toLocaleString()} | Completed: ₹{Number(wager.turnover_completed).toLocaleString()}</p>
                    </div>
                    <Badge variant={wager.is_fulfilled ? "default" : "secondary"}>{wager.is_fulfilled ? "Fulfilled" : "Pending"}</Badge>
                  </div>
                  <Progress value={(Number(wager.turnover_completed) / Number(wager.turnover_required)) * 100} />
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Adjust Amount</Label>
                      <Input type="number" placeholder="Amount" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} />
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setAdjustType("reduce"); adjustWager(wager.id); }}><Minus className="w-4 h-4 mr-1" />Reduce</Button>
                    <Button size="sm" variant="outline" onClick={() => { setAdjustType("add"); adjustWager(wager.id); }}><Plus className="w-4 h-4 mr-1" />Add</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {selectedUser && wagerTracking.length === 0 && <Card><CardContent className="py-8 text-center text-muted-foreground">No wager requirements found for this user</CardContent></Card>}
      </div>
    </AdminLayout>
  );
};

export default WagerAdjustment;
