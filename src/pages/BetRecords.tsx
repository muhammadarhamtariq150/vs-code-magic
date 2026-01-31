import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BetRecord {
  id: string;
  game_name: string;
  bet_amount: number;
  win_amount: number;
  result: string;
  created_at: string;
}

const BetRecords = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<BetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBet, setTotalBet] = useState(0);
  const [totalWin, setTotalWin] = useState(0);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("game_transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        setRecords(data || []);
        
        const betSum = data?.reduce((sum, r) => sum + r.bet_amount, 0) || 0;
        const winSum = data?.reduce((sum, r) => sum + r.win_amount, 0) || 0;
        setTotalBet(betSum);
        setTotalWin(winSum);
      } catch (error) {
        console.error("Error fetching bet records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  const getResultColor = (winAmount: number, betAmount: number) => {
    if (winAmount > betAmount) return "text-green-500";
    if (winAmount < betAmount) return "text-red-500";
    return "text-yellow-500";
  };

  const netProfit = totalWin - totalBet;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Bet Records</h1>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-primary/20 to-teal-600/20 border-primary/30">
          <CardContent className="py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Bet</p>
                <p className="text-lg font-bold text-red-500">
                  ₨{totalBet.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Win</p>
                <p className="text-lg font-bold text-green-500">
                  ₨{totalWin.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-lg font-bold ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {netProfit >= 0 ? "+" : ""}₨{netProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading records...</p>
          </div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No bet records found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <Card key={record.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{record.game_name}</span>
                        {record.win_amount > record.bet_amount ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : record.win_amount < record.bet_amount ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(record.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Bet: ₨{record.bet_amount.toFixed(2)}
                      </p>
                      <p className={`font-bold ${getResultColor(record.win_amount, record.bet_amount)}`}>
                        {record.win_amount > record.bet_amount ? "+" : ""}
                        ₨{(record.win_amount - record.bet_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      Result: <span className="text-foreground">{record.result}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BetRecords;
