import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Plus, Minus, Search } from "lucide-react";

const Adjustment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    user_id: string;
    username: string;
    balance: number;
  } | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "reduce">("add");
  const [amount, setAmount] = useState("");
  const [turnoverMultiplier, setTurnoverMultiplier] = useState("1");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user: adminUser } = useAuth();

  const searchUser = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("user_id, username")
        .ilike("username", `%${searchQuery}%`)
        .single();

      if (error || !profile) {
        toast({
          title: "User not found",
          description: "No user found with that username",
          variant: "destructive",
        });
        setSelectedUser(null);
        setLoading(false);
        return;
      }

      // Get wallet balance
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", profile.user_id)
        .single();

      setSelectedUser({
        user_id: profile.user_id,
        username: profile.username,
        balance: Number(wallet?.balance || 0),
      });
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async () => {
    if (!selectedUser || !adminUser) return;

    const adjustmentAmount = parseFloat(amount);
    if (isNaN(adjustmentAmount) || adjustmentAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    const multiplier = parseFloat(turnoverMultiplier);
    if (isNaN(multiplier) || multiplier < 0) {
      toast({
        title: "Invalid turnover",
        description: "Please enter a valid turnover multiplier",
        variant: "destructive",
      });
      return;
    }

    if (adjustmentType === "reduce" && adjustmentAmount > selectedUser.balance) {
      toast({
        title: "Insufficient balance",
        description: "Cannot reduce more than current balance",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const finalAmount = adjustmentType === "add" ? adjustmentAmount : -adjustmentAmount;
      const newBalance = selectedUser.balance + finalAmount;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", selectedUser.user_id);

      if (walletError) throw walletError;

      // Record adjustment
      const { error: adjustmentError } = await supabase.from("adjustments").insert({
        user_id: selectedUser.user_id,
        adjustment_type: adjustmentType === "add" ? "manual_add" : "manual_reduce",
        amount: finalAmount,
        turnover_multiplier: multiplier,
        turnover_required: adjustmentAmount * multiplier,
        reason: reason || `Manual ${adjustmentType}`,
        processed_by: adminUser.id,
      });

      if (adjustmentError) throw adjustmentError;

      // If there's turnover requirement, create wager tracking
      if (multiplier > 0 && adjustmentType === "add") {
        const { data: adjustment } = await supabase
          .from("adjustments")
          .select("id")
          .eq("user_id", selectedUser.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (adjustment) {
          await supabase.from("wager_tracking").insert({
            user_id: selectedUser.user_id,
            adjustment_id: adjustment.id,
            turnover_required: adjustmentAmount * multiplier,
            turnover_completed: 0,
          });
        }
      }

      toast({
        title: "Adjustment successful",
        description: `${adjustmentType === "add" ? "Added" : "Reduced"} ₹${adjustmentAmount} ${
          adjustmentType === "add" ? "to" : "from"
        } ${selectedUser.username}'s account`,
      });

      // Update local state
      setSelectedUser({
        ...selectedUser,
        balance: newBalance,
      });

      // Reset form
      setAmount("");
      setTurnoverMultiplier("1");
      setReason("");
    } catch (error: any) {
      toast({
        title: "Adjustment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Balance Adjustment</h1>
          <p className="text-muted-foreground">
            Add or reduce balance with turnover requirements
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUser()}
              />
              <Button onClick={searchUser} disabled={loading}>
                Search
              </Button>
            </div>

            {selectedUser && (
              <div className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-lg">{selectedUser.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Current Balance:{" "}
                      <span className="text-foreground font-medium">
                        ₹{selectedUser.balance.toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Make Adjustment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={adjustmentType === "add" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("add")}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Balance
                </Button>
                <Button
                  variant={adjustmentType === "reduce" ? "destructive" : "outline"}
                  onClick={() => setAdjustmentType("reduce")}
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Reduce Balance
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="any"
                  />
                </div>
                <div>
                  <Label>Turnover Multiplier (x)</Label>
                  <Select value={turnoverMultiplier} onValueChange={setTurnoverMultiplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select multiplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0x (No turnover)</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                      <SelectItem value="3">3x</SelectItem>
                      <SelectItem value="5">5x</SelectItem>
                      <SelectItem value="10">10x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {amount && parseFloat(turnoverMultiplier) > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    Turnover required:{" "}
                    <span className="font-bold">
                      ₹{(parseFloat(amount || "0") * parseFloat(turnoverMultiplier)).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}

              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  placeholder="Enter reason for adjustment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleAdjustment}
                disabled={loading || !amount}
                className="w-full"
                variant={adjustmentType === "add" ? "default" : "destructive"}
              >
                {loading
                  ? "Processing..."
                  : adjustmentType === "add"
                  ? `Add ₹${amount || 0}`
                  : `Reduce ₹${amount || 0}`}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default Adjustment;
