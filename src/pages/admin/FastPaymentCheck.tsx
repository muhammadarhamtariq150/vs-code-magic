import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { format, subDays } from "date-fns";

interface Deposit {
  id: string;
  user_id: string;
  method: string;
  amount: number;
  status: string;
  transaction_id: string | null;
  sender_account: string | null;
  created_at: string;
  username?: string;
}

const FastPaymentCheck = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    totalAmount: 0,
  });
  const { toast } = useToast();

  const fetchDeposits = async (userId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("deposits")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: depositsData, error } = await query;

      if (error) throw error;

      // Get usernames for all deposits
      const userIds = [...new Set(depositsData?.map((d) => d.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", userIds);

      const depositsWithUsernames =
        depositsData?.map((d) => ({
          ...d,
          amount: Number(d.amount),
          username: profiles?.find((p) => p.user_id === d.user_id)?.username || "Unknown",
        })) || [];

      setDeposits(depositsWithUsernames);

      // Calculate stats
      const pending = depositsWithUsernames.filter((d) => d.status === "pending").length;
      const confirmed = depositsWithUsernames.filter((d) => d.status === "confirmed").length;
      const rejected = depositsWithUsernames.filter((d) => d.status === "rejected").length;
      const totalAmount = depositsWithUsernames
        .filter((d) => d.status === "confirmed")
        .reduce((sum, d) => sum + d.amount, 0);

      setStats({
        total: depositsWithUsernames.length,
        pending,
        confirmed,
        rejected,
        totalAmount,
      });
    } catch (error: any) {
      toast({
        title: "Failed to load deposits",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchByUsername = async () => {
    if (!searchQuery.trim()) {
      fetchDeposits();
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("username", `%${searchQuery}%`)
        .single();

      if (profile) {
        fetchDeposits(profile.user_id);
      } else {
        toast({
          title: "User not found",
          description: "No user found with that username",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const updateDepositStatus = async (depositId: string, status: "confirmed" | "rejected") => {
    try {
      const { error } = await supabase
        .from("deposits")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", depositId);

      if (error) throw error;

      // If confirmed, add to wallet
      if (status === "confirmed") {
        const deposit = deposits.find((d) => d.id === depositId);
        if (deposit) {
          const { data: wallet } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", deposit.user_id)
            .single();

          if (wallet) {
            await supabase
              .from("wallets")
              .update({ balance: Number(wallet.balance) + deposit.amount })
              .eq("user_id", deposit.user_id);
          }
        }
      }

      setDeposits((prev) => prev.map((d) => (d.id === depositId ? { ...d, status } : d)));

      toast({
        title: status === "confirmed" ? "Deposit Confirmed" : "Deposit Rejected",
        description: `Deposit has been ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [startDate, endDate]);

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmed: "default",
      rejected: "destructive",
      pending: "secondary",
    };

    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fast Payment Check</h1>
          <p className="text-muted-foreground">Review and manage deposit requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">Total Orders</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">Confirmed</div>
              <div className="text-2xl font-bold text-green-500">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">Rejected</div>
              <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">Total Deposited</div>
              <div className="text-2xl font-bold text-green-500">
                ₹{stats.totalAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Search Deposits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter username to filter (leave empty for all)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchByUsername()}
              />
              <Button onClick={searchByUsername} disabled={loading}>
                {loading ? "Loading..." : "Search"}
              </Button>
            </div>

            <DateRangeFilter onDateChange={handleDateChange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deposit Orders ({deposits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      {format(new Date(deposit.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{deposit.username}</TableCell>
                    <TableCell className="capitalize">{deposit.method}</TableCell>
                    <TableCell className="font-medium">
                      ₹{deposit.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {deposit.transaction_id || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deposit.status)}
                        {getStatusBadge(deposit.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {deposit.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateDepositStatus(deposit.id, "confirmed")}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateDepositStatus(deposit.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
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

export default FastPaymentCheck;
