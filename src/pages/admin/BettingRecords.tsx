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
import { Search, Gamepad2 } from "lucide-react";
import { format, subDays } from "date-fns";

interface BettingRecord {
  id: string;
  game_name: string;
  bet_amount: number;
  win_amount: number;
  result: string;
  created_at: string;
}

const BettingRecords = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState<BettingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [memberUsername, setMemberUsername] = useState("");
  const [stats, setStats] = useState({ totalBets: 0, totalWins: 0, netResult: 0 });
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

      // Get game transactions
      const { data: transactions, error } = await supabase
        .from("game_transactions")
        .select("*")
        .eq("user_id", profile.user_id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const bettingRecords: BettingRecord[] =
        transactions?.map((t) => ({
          id: t.id,
          game_name: t.game_name,
          bet_amount: Number(t.bet_amount),
          win_amount: Number(t.win_amount),
          result: t.result,
          created_at: t.created_at,
        })) || [];

      // Calculate stats
      const totalBets = bettingRecords.reduce((sum, r) => sum + r.bet_amount, 0);
      const totalWins = bettingRecords.reduce((sum, r) => sum + r.win_amount, 0);

      setRecords(bettingRecords);
      setStats({
        totalBets,
        totalWins,
        netResult: totalWins - totalBets,
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

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Betting Records</h1>
          <p className="text-muted-foreground">View all betting history for any member</p>
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
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Bets</div>
                  <div className="text-2xl font-bold text-red-500">
                    ₹{stats.totalBets.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Wins</div>
                  <div className="text-2xl font-bold text-green-500">
                    ₹{stats.totalWins.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Net Result</div>
                  <div
                    className={`text-2xl font-bold ${
                      stats.netResult >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stats.netResult >= 0 ? "+" : ""}₹{stats.netResult.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Betting Records for {memberUsername} ({records.length} bets)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead className="text-right">Bet Amount</TableHead>
                      <TableHead className="text-right">Win Amount</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.created_at), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="font-medium">{record.game_name}</TableCell>
                        <TableCell className="text-right text-red-500">
                          ₹{record.bet_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-green-500">
                          ₹{record.win_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.win_amount > record.bet_amount
                                ? "default"
                                : record.win_amount > 0
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {record.result}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default BettingRecords;
