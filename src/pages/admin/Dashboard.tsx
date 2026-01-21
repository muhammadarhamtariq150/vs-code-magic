import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Gamepad2, Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalDeposits: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalBets: number;
  totalWinnings: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDeposits: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalBets: 0,
    totalWinnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Get deposits stats
        const { data: deposits } = await supabase
          .from("deposits")
          .select("amount, status");

        const totalDeposits = deposits
          ?.filter((d) => d.status === "confirmed")
          .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

        const pendingDeposits = deposits?.filter((d) => d.status === "pending").length || 0;

        // Get withdrawals stats
        const { data: withdrawals } = await supabase
          .from("withdrawals")
          .select("status");

        const pendingWithdrawals = withdrawals?.filter((w) => 
          w.status === "pending" || w.status === "review"
        ).length || 0;

        // Get game transactions stats
        const { data: transactions } = await supabase
          .from("game_transactions")
          .select("bet_amount, win_amount");

        const totalBets = transactions?.reduce((sum, t) => sum + Number(t.bet_amount), 0) || 0;
        const totalWinnings = transactions?.reduce((sum, t) => sum + Number(t.win_amount), 0) || 0;

        setStats({
          totalUsers: userCount || 0,
          totalDeposits,
          pendingDeposits,
          pendingWithdrawals,
          totalBets,
          totalWinnings,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Deposits",
      value: `₹${stats.totalDeposits.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Pending Deposits",
      value: stats.pendingDeposits,
      icon: Wallet,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Pending Withdrawals",
      value: stats.pendingWithdrawals,
      icon: Wallet,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Total Bets",
      value: `₹${stats.totalBets.toLocaleString()}`,
      icon: Gamepad2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Total Winnings",
      value: `₹${stats.totalWinnings.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your gaming platform</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-32"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Platform Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                ₹{(stats.totalBets - stats.totalWinnings).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total Bets - Total Winnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                House Edge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalBets > 0
                  ? (((stats.totalBets - stats.totalWinnings) / stats.totalBets) * 100).toFixed(2)
                  : 0}
                %
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Platform profit margin
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
