import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, CheckCircle, XCircle, Clock } from "lucide-react";
import { format, subDays } from "date-fns";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  status: string;
  account_details: any;
  rejection_reason: string | null;
  created_at: string;
  username?: string;
}

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const { toast } = useToast();
  const { user: adminUser } = useAuth();

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set(data?.map((w) => w.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const withdrawalsWithUsernames = data?.map((w) => ({
        ...w,
        amount: Number(w.amount),
        username: profiles?.find((p) => p.user_id === w.user_id)?.username || "Unknown",
      })) || [];

      setWithdrawals(withdrawalsWithUsernames);
    } catch (error: any) {
      toast({ title: "Failed to load withdrawals", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "processing" | "success" | "rejected") => {
    try {
      const withdrawal = withdrawals.find((w) => w.id === id);
      if (!withdrawal) return;

      const { error } = await supabase
        .from("withdrawals")
        .update({ status, processed_by: adminUser?.id, processed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // If rejected, return amount to wallet
      if (status === "rejected") {
        const { data: wallet } = await supabase.from("wallets").select("balance").eq("user_id", withdrawal.user_id).single();
        if (wallet) {
          await supabase.from("wallets").update({ balance: Number(wallet.balance) + withdrawal.amount }).eq("user_id", withdrawal.user_id);
        }
      }

      setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
      toast({ title: `Withdrawal ${status}` });
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => { fetchWithdrawals(); }, [startDate, endDate]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default", rejected: "destructive", pending: "secondary", review: "outline", processing: "outline",
    };
    return <Badge variant={variants[status] || "secondary"} className="capitalize">{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Withdrawal Management</h1>
          <p className="text-muted-foreground">Review and process withdrawal requests</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Filter</CardTitle></CardHeader>
          <CardContent><DateRangeFilter onDateChange={(s, e) => { setStartDate(s); setEndDate(e); }} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5" />Withdrawals ({withdrawals.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Account Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{format(new Date(w.created_at), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell className="font-medium">{w.username}</TableCell>
                    <TableCell className="capitalize">{w.method}</TableCell>
                    <TableCell className="font-medium">₹{w.amount.toLocaleString()}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="text-xs space-y-1">
                        {Object.entries(w.account_details || {}).map(([key, value]) => (
                          <div key={key} className="flex gap-1">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="font-medium truncate">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(w.status)}</TableCell>
                    <TableCell>
                      {(w.status === "pending" || w.status === "review") && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateStatus(w.id, "success")}><CheckCircle className="w-4 h-4 mr-1" />Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateStatus(w.id, "rejected")}><XCircle className="w-4 h-4 mr-1" />Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default WithdrawalManagement;
