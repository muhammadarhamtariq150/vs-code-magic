import { useState } from "react";
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
import { Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, subDays } from "date-fns";

interface FinancialRecord {
  id: string;
  type: "deposit" | "withdrawal" | "bet" | "win" | "bonus" | "adjustment";
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
}

const MemberFinancialRecords = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [memberUsername, setMemberUsername] = useState("");
  const { toast } = useToast();

  const searchRecords = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // First find the user
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, username")
        .ilike("username", `%${searchQuery}%`)
        .single();

      if (!profile) {
        toast({
          title: "User not found",
          description: "No user found with that username",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setMemberUsername(profile.username);
      const userId = profile.user_id;

      // Get deposits
      const { data: deposits } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      // Get withdrawals
      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      // Get game transactions
      const { data: transactions } = await supabase
        .from("game_transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      // Get adjustments
      const { data: adjustments } = await supabase
        .from("adjustments")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      // Combine and sort all records
      const allRecords: FinancialRecord[] = [];
      let runningBalance = 0;

      // Add deposits
      deposits?.forEach((d) => {
        if (d.status === "confirmed") {
          allRecords.push({
            id: d.id,
            type: "deposit",
            amount: Number(d.amount),
            balance_before: 0,
            balance_after: 0,
            description: `Deposit via ${d.method}`,
            created_at: d.created_at,
          });
        }
      });

      // Add withdrawals
      withdrawals?.forEach((w) => {
        allRecords.push({
          id: w.id,
          type: "withdrawal",
          amount: -Number(w.amount),
          balance_before: 0,
          balance_after: 0,
          description: `Withdrawal - ${w.status}`,
          created_at: w.created_at,
        });
      });

      // Add game transactions
      transactions?.forEach((t) => {
        allRecords.push({
          id: t.id,
          type: Number(t.win_amount) > 0 ? "win" : "bet",
          amount: Number(t.win_amount) - Number(t.bet_amount),
          balance_before: 0,
          balance_after: 0,
          description: `${t.game_name}: Bet ₹${t.bet_amount}, Won ₹${t.win_amount}`,
          created_at: t.created_at,
        });
      });

      // Add adjustments
      adjustments?.forEach((a) => {
        allRecords.push({
          id: a.id,
          type: "adjustment",
          amount: Number(a.amount),
          balance_before: 0,
          balance_after: 0,
          description: `${a.adjustment_type}: ${a.reason || "Manual adjustment"}`,
          created_at: a.created_at,
        });
      });

      // Sort by date descending
      allRecords.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecords(allRecords);
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

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
      case "win":
      case "bonus":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "withdrawal":
      case "bet":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      deposit: "default",
      withdrawal: "destructive",
      bet: "secondary",
      win: "default",
      bonus: "default",
      adjustment: "outline",
    };

    return <Badge variant={variants[type] || "secondary"}>{type.toUpperCase()}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member Financial Records</h1>
          <p className="text-muted-foreground">View complete financial history for any member</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter username or game ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchRecords()}
              />
              <Button onClick={searchRecords} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>

            <DateRangeFilter onDateChange={handleDateChange} />
          </CardContent>
        </Card>

        {records.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Financial Records for {memberUsername} ({records.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.created_at), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(record.type)}
                          {getTypeBadge(record.type)}
                        </div>
                      </TableCell>
                      <TableCell>{record.description}</TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          record.amount >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {record.amount >= 0 ? "+" : ""}₹{Math.abs(record.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default MemberFinancialRecords;
