import { ArrowLeft, Users, UserPlus, Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AgentStats {
  totalDownline: number;
  totalRegistrations: number;
  firstDepositMembers: number;
  depositMembers: number;
  withdrawalMembers: number;
  bettorsWithValidBets: number;
  netTotalWinLoss: number;
  firstDepositAmount: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalValidBetAmount: number;
}

const AgentManagement = () => {
  const { user } = useAuth();
  const { balance } = useWallet();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AgentStats>({
    totalDownline: 0,
    totalRegistrations: 0,
    firstDepositMembers: 0,
    depositMembers: 0,
    withdrawalMembers: 0,
    bettorsWithValidBets: 0,
    netTotalWinLoss: 0,
    firstDepositAmount: 0,
    totalDeposit: 0,
    totalWithdrawal: 0,
    totalValidBetAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastModified, setLastModified] = useState<string>("");

  useEffect(() => {
    const fetchAgentStats = async () => {
      if (!user) return;

      try {
        // Get all downline members (users who have this user as their agent)
        const { data: downlineProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, created_at")
          .eq("agent_id", user.id);

        if (profilesError) throw profilesError;

        const downlineUserIds = downlineProfiles?.map((p) => p.user_id) || [];
        const totalDownline = downlineUserIds.length;

        if (totalDownline === 0) {
          setStats({
            totalDownline: 0,
            totalRegistrations: 0,
            firstDepositMembers: 0,
            depositMembers: 0,
            withdrawalMembers: 0,
            bettorsWithValidBets: 0,
            netTotalWinLoss: 0,
            firstDepositAmount: 0,
            totalDeposit: 0,
            totalWithdrawal: 0,
            totalValidBetAmount: 0,
          });
          setLoading(false);
          return;
        }

        // Get deposits for downline members
        const { data: deposits, error: depositsError } = await supabase
          .from("deposits")
          .select("user_id, amount, created_at, status")
          .in("user_id", downlineUserIds)
          .eq("status", "confirmed");

        if (depositsError) throw depositsError;

        // Get withdrawals for downline members
        const { data: withdrawals, error: withdrawalsError } = await supabase
          .from("withdrawals")
          .select("user_id, amount, status")
          .in("user_id", downlineUserIds)
          .eq("status", "success");

        if (withdrawalsError) throw withdrawalsError;

        // Get game transactions for downline members
        const { data: transactions, error: transactionsError } = await supabase
          .from("game_transactions")
          .select("user_id, bet_amount, win_amount")
          .in("user_id", downlineUserIds);

        if (transactionsError) throw transactionsError;

        // Calculate stats
        const depositMemberIds = new Set(deposits?.map((d) => d.user_id) || []);
        const withdrawalMemberIds = new Set(withdrawals?.map((w) => w.user_id) || []);
        const bettorIds = new Set(transactions?.map((t) => t.user_id) || []);

        // First deposit calculation - get the first deposit for each user
        const firstDeposits: { [key: string]: number } = {};
        deposits?.forEach((d) => {
          if (!firstDeposits[d.user_id]) {
            firstDeposits[d.user_id] = d.amount;
          }
        });

        const firstDepositAmount = Object.values(firstDeposits).reduce((sum, amt) => sum + amt, 0);
        const totalDeposit = deposits?.reduce((sum, d) => sum + d.amount, 0) || 0;
        const totalWithdrawal = withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;

        const totalBetAmount = transactions?.reduce((sum, t) => sum + t.bet_amount, 0) || 0;
        const totalWinAmount = transactions?.reduce((sum, t) => sum + t.win_amount, 0) || 0;
        const netWinLoss = totalWinAmount - totalBetAmount;

        setStats({
          totalDownline,
          totalRegistrations: totalDownline,
          firstDepositMembers: Object.keys(firstDeposits).length,
          depositMembers: depositMemberIds.size,
          withdrawalMembers: withdrawalMemberIds.size,
          bettorsWithValidBets: bettorIds.size,
          netTotalWinLoss: netWinLoss,
          firstDepositAmount,
          totalDeposit,
          totalWithdrawal,
          totalValidBetAmount: totalBetAmount,
        });

        setLastModified(new Date().toLocaleString());
      } catch (error) {
        console.error("Error fetching agent stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Agent Management</h1>
        </div>

        {/* Wallet Display */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-300" />
              <span className="text-white/80">Wallet</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              ₨ {balance?.toFixed(2) || "0.00"}
            </p>
          </div>
          <Button
            variant="secondary"
            className="bg-teal-500 hover:bg-teal-400 text-white"
            onClick={() => navigate("/")}
          >
            Transfer Out
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Last Modified */}
        <p className="text-sm text-muted-foreground">
          Last Modified on: {lastModified || new Date().toLocaleString()}
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 border-0">
            <CardContent className="p-4">
              <p className="text-xs text-white/80">Total Downline Member</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-white">
                  {loading ? "..." : stats.totalDownline}
                </span>
                <Users className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-400 to-orange-500 border-0">
            <CardContent className="p-4">
              <p className="text-xs text-white/80">Total Registration Members</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-white">
                  {loading ? "..." : stats.totalRegistrations}
                </span>
                <UserPlus className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-400 to-cyan-500 border-0">
            <CardContent className="p-4">
              <p className="text-xs text-white/80">Members of First Deposit</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-white">
                  {loading ? "..." : stats.firstDepositMembers}
                </span>
                <DollarSign className="w-8 h-8 text-white/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-1 h-5 bg-primary rounded-full" />
              Data Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Deposit Member</p>
                <p className="text-xl font-bold text-primary">
                  {loading ? "..." : stats.depositMembers}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Withdrawal Member</p>
                <p className="text-xl font-bold text-primary">
                  {loading ? "..." : stats.withdrawalMembers}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bettors with Valid Bets</p>
                <p className="text-xl font-bold text-primary">
                  {loading ? "..." : stats.bettorsWithValidBets}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-sm text-muted-foreground">Net Total (Win-Loss)</p>
                <p className={`text-xl font-bold ${stats.netTotalWinLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {loading ? "..." : stats.netTotalWinLoss.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Promotion & Rebate</p>
                <p className="text-xl font-bold text-primary">0.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">First Deposit Amount</p>
                <p className="text-xl font-bold text-primary">
                  {loading ? "..." : stats.firstDepositAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Deposit</p>
                <p className="text-xl font-bold text-green-500">
                  {loading ? "..." : stats.totalDeposit.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawal</p>
                <p className="text-xl font-bold text-red-500">
                  {loading ? "..." : stats.totalWithdrawal.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members with Valid Bet</p>
                <p className="text-xl font-bold text-primary">
                  {loading ? "..." : stats.totalValidBetAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentManagement;
