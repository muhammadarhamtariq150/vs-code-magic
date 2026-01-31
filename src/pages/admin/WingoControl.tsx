import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Gamepad2, Target, Clock, RefreshCw, TrendingUp, DollarSign, Users, Zap } from "lucide-react";

type DurationType = "1min" | "2min" | "3min" | "5min";

interface WingoRound {
  id: string;
  period_id: string;
  duration_type: string;
  status: string;
  end_time: string;
  winning_number?: number;
  winning_color?: string;
}

interface AdminControl {
  duration_type: string;
  next_number: number;
  is_active: boolean;
}

interface BettingStats {
  roundId: string;
  periodId: string;
  endTime: string;
  totalBets: number;
  totalAmount: number;
  colors: {
    green: { count: number; amount: number };
    red: { count: number; amount: number };
    violet: { count: number; amount: number };
  };
  sizes: {
    big: { count: number; amount: number };
    small: { count: number; amount: number };
  };
  numbers: Record<string, { count: number; amount: number }>;
}

interface Recommendation {
  bestForHouse: number;
  bestForHousePayout: number;
  worstForHouse: number;
  worstForHousePayout: number;
  potentialPayouts: Record<number, number>;
}

const DURATION_TYPES: DurationType[] = ["1min", "2min", "3min", "5min"];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const getColorForNumber = (num: number): string => {
  if (num === 0 || num === 5) return "violet";
  if (num % 2 === 0) return "red";
  return "green";
};

const getColorClass = (num: number): string => {
  const color = getColorForNumber(num);
  if (color === "violet") return "bg-purple-600";
  if (color === "red") return "bg-red-500";
  return "bg-green-500";
};

const WingoControl = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [activeDuration, setActiveDuration] = useState<DurationType>("5min");
  const [activeRounds, setActiveRounds] = useState<Record<DurationType, WingoRound | null>>({
    "1min": null,
    "2min": null,
    "3min": null,
    "5min": null,
  });
  const [controls, setControls] = useState<AdminControl[]>([]);
  const [bettingStats, setBettingStats] = useState<Record<DurationType, BettingStats | null>>({
    "1min": null,
    "2min": null,
    "3min": null,
    "5min": null,
  });
  const [recommendations, setRecommendations] = useState<Record<DurationType, Recommendation | null>>({
    "1min": null,
    "2min": null,
    "3min": null,
    "5min": null,
  });
  const [selectedNumbers, setSelectedNumbers] = useState<Record<DurationType, number | null>>({
    "1min": null,
    "2min": null,
    "3min": null,
    "5min": null,
  });
  const [loading, setLoading] = useState<Record<DurationType, boolean>>({
    "1min": false,
    "2min": false,
    "3min": false,
    "5min": false,
  });
  const [timeLeft, setTimeLeft] = useState<Record<DurationType, { minutes: number; seconds: number }>>({
    "1min": { minutes: 0, seconds: 0 },
    "2min": { minutes: 0, seconds: 0 },
    "3min": { minutes: 0, seconds: 0 },
    "5min": { minutes: 0, seconds: 0 },
  });

  // Fetch active rounds for all durations
  const fetchRounds = useCallback(async () => {
    for (const duration of DURATION_TYPES) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wingo?action=get-round&duration=${duration}`,
          {
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );
        const result = await response.json();
        if (result.round) {
          setActiveRounds((prev) => ({ ...prev, [duration]: result.round }));
        }
      } catch (error) {
        console.error(`Error fetching ${duration} round:`, error);
      }
    }
  }, []);

  // Fetch betting stats for all durations
  const fetchBettingStats = useCallback(async () => {
    if (!session?.access_token) return;

    for (const duration of DURATION_TYPES) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wingo?action=get-betting-stats&duration=${duration}`,
          {
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              "Authorization": `Bearer ${session.access_token}`,
            },
          }
        );
        const result = await response.json();
        if (result.stats) {
          setBettingStats((prev) => ({ ...prev, [duration]: result.stats }));
          setRecommendations((prev) => ({ ...prev, [duration]: result.recommendation }));
        }
      } catch (error) {
        console.error(`Error fetching ${duration} stats:`, error);
      }
    }
  }, [session]);

  // Fetch current admin controls
  const fetchControls = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wingo?action=get-controls`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
          },
        }
      );
      const result = await response.json();
      if (result.controls) {
        setControls(result.controls);
        result.controls.forEach((control: AdminControl) => {
          if (control.is_active) {
            setSelectedNumbers((prev) => ({
              ...prev,
              [control.duration_type]: control.next_number,
            }));
          }
        });
      }
    } catch (error) {
      console.error("Error fetching controls:", error);
    }
  }, [session]);

  // Set next result
  const setNextResult = async (durationType: DurationType, number: number) => {
    if (!session?.access_token) return;

    setLoading((prev) => ({ ...prev, [durationType]: true }));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wingo?action=set-next-result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            durationType,
            nextNumber: number,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Result Set",
          description: `Next ${durationType} result will be ${number} (${getColorForNumber(number).toUpperCase()})`,
        });
        setSelectedNumbers((prev) => ({ ...prev, [durationType]: number }));
        fetchControls();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to set result",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set result",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [durationType]: false }));
    }
  };

  // Process rounds manually
  const processRounds = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wingo?action=process-rounds`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const result = await response.json();
      toast({
        title: "Rounds Processed",
        description: `Processed ${result.processed?.length || 0} rounds`,
      });
      fetchRounds();
      fetchControls();
      fetchBettingStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process rounds",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRounds();
    fetchControls();
    fetchBettingStats();

    // Auto-refresh every 5 seconds for real-time stats
    const interval = setInterval(() => {
      fetchRounds();
      fetchControls();
      fetchBettingStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [session, fetchRounds, fetchControls, fetchBettingStats]);

  // Timer countdown
  useEffect(() => {
    const updateTimers = () => {
      const newTimeLeft: Record<DurationType, { minutes: number; seconds: number }> = {
        "1min": { minutes: 0, seconds: 0 },
        "2min": { minutes: 0, seconds: 0 },
        "3min": { minutes: 0, seconds: 0 },
        "5min": { minutes: 0, seconds: 0 },
      };

      for (const duration of DURATION_TYPES) {
        const round = activeRounds[duration];
        if (round) {
          const endTime = new Date(round.end_time).getTime();
          const now = Date.now();
          const diff = Math.max(0, endTime - now);
          newTimeLeft[duration] = {
            minutes: Math.floor(diff / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
          };
        }
      }

      setTimeLeft(newTimeLeft);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [activeRounds]);

  const getActiveControl = (durationType: DurationType) => {
    return controls.find((c) => c.duration_type === durationType && c.is_active);
  };

  const stats = bettingStats[activeDuration];
  const recommendation = recommendations[activeDuration];
  const round = activeRounds[activeDuration];
  const time = timeLeft[activeDuration];
  const activeControl = getActiveControl(activeDuration);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Wingo Game Control</h1>
            <p className="text-muted-foreground">
              Real-time betting stats & manual result control
            </p>
          </div>
          <Button onClick={processRounds} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Process Rounds
          </Button>
        </div>

        {/* Duration Tabs */}
        <Tabs value={activeDuration} onValueChange={(v) => setActiveDuration(v as DurationType)}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            {DURATION_TYPES.map((duration) => (
              <TabsTrigger key={duration} value={duration} className="relative">
                {duration}
                {getActiveControl(duration) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {DURATION_TYPES.map((duration) => (
            <TabsContent key={duration} value={duration} className="space-y-6">
              {/* Current Round Info & Timer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm opacity-80">Time Remaining</span>
                    </div>
                    <div className="text-3xl font-mono font-bold">
                      {String(timeLeft[duration].minutes).padStart(2, "0")}:
                      {String(timeLeft[duration].seconds).padStart(2, "0")}
                    </div>
                    <p className="text-sm opacity-80 mt-1">
                      Period: {activeRounds[duration]?.period_id || "Loading..."}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      <span className="text-sm">Total Bets</span>
                    </div>
                    <div className="text-3xl font-bold">
                      {bettingStats[duration]?.totalBets || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Active players this round
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm">Total Amount</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      ₨{bettingStats[duration]?.totalAmount?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      House take this round
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Active Control Status */}
              {getActiveControl(duration) && (
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-green-600" />
                      <span className="text-green-700 dark:text-green-400 font-medium text-lg">
                        Next result set to:
                      </span>
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl ${getColorClass(
                          getActiveControl(duration)!.next_number
                        )}`}
                      >
                        {getActiveControl(duration)!.next_number}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {getColorForNumber(getActiveControl(duration)!.next_number).toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Real-time Betting Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color Bets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Color Bets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full" />
                        <span className="font-medium">GREEN</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ₨{bettingStats[duration]?.colors.green.amount?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {bettingStats[duration]?.colors.green.count || 0} bets
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-500 rounded-full" />
                        <span className="font-medium">RED</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ₨{bettingStats[duration]?.colors.red.amount?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {bettingStats[duration]?.colors.red.count || 0} bets
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full" />
                        <span className="font-medium">VIOLET</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ₨{bettingStats[duration]?.colors.violet.amount?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {bettingStats[duration]?.colors.violet.count || 0} bets
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Size Bets & Recommendation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Size Bets & AI Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">BIG (5-9)</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ₨{bettingStats[duration]?.sizes.big.amount?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {bettingStats[duration]?.sizes.big.count || 0} bets
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">SMALL (0-4)</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ₨{bettingStats[duration]?.sizes.small.amount?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {bettingStats[duration]?.sizes.small.count || 0} bets
                        </div>
                      </div>
                    </div>

                    {recommendations[duration] && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-300">
                        <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                          💡 Best for House (lowest payout):
                        </p>
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-2xl ${getColorClass(
                              recommendations[duration]!.bestForHouse
                            )}`}
                          >
                            {recommendations[duration]!.bestForHouse}
                          </span>
                          <div>
                            <p className="font-bold">
                              Number {recommendations[duration]!.bestForHouse}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Payout: ₨{recommendations[duration]!.bestForHousePayout.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="ml-auto"
                            onClick={() => setNextResult(duration, recommendations[duration]!.bestForHouse)}
                          >
                            Set This
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Number Selection Grid */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Set Next Result (Click to Set)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-4">
                    {NUMBERS.map((num) => {
                      const numStats = bettingStats[duration]?.numbers[num.toString()];
                      const payout = recommendations[duration]?.potentialPayouts[num];
                      const isSelected = selectedNumbers[duration] === num;

                      return (
                        <div key={num} className="text-center">
                          <button
                            onClick={() => setNextResult(duration, num)}
                            disabled={loading[duration]}
                            className={`w-full aspect-square rounded-full flex items-center justify-center text-xl font-bold text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${getColorClass(
                              num
                            )} ${isSelected ? "ring-4 ring-primary ring-offset-2" : ""}`}
                          >
                            {num}
                          </button>
                          <div className="mt-2 text-xs">
                            <p className="font-medium">₨{numStats?.amount || 0}</p>
                            <p className="text-muted-foreground">{numStats?.count || 0} bets</p>
                            {payout !== undefined && (
                              <p className="text-red-500 text-xs">-₨{payout.toFixed(0)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Color Legend */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <Badge
                      variant="outline"
                      className="justify-center py-2 bg-green-500/20 border-green-500 text-green-600"
                    >
                      1,3,7,9 = GREEN
                    </Badge>
                    <Badge
                      variant="outline"
                      className="justify-center py-2 bg-purple-500/20 border-purple-500 text-purple-600"
                    >
                      0,5 = VIOLET
                    </Badge>
                    <Badge
                      variant="outline"
                      className="justify-center py-2 bg-red-500/20 border-red-500 text-red-600"
                    >
                      2,4,6,8 = RED
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Potential Payouts Table */}
              {recommendations[duration] && (
                <Card>
                  <CardHeader>
                    <CardTitle>Potential Payouts by Number</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Number</th>
                            <th className="text-center py-2">Color</th>
                            <th className="text-right py-2">Bets on Number</th>
                            <th className="text-right py-2">Total Payout</th>
                            <th className="text-right py-2">House Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {NUMBERS.map((num) => {
                            const payout = recommendations[duration]!.potentialPayouts[num];
                            const houseTake = bettingStats[duration]?.totalAmount || 0;
                            const profit = houseTake - payout;

                            return (
                              <tr key={num} className="border-b border-muted">
                                <td className="py-2">
                                  <span
                                    className={`inline-flex w-8 h-8 rounded-full items-center justify-center text-white font-bold ${getColorClass(
                                      num
                                    )}`}
                                  >
                                    {num}
                                  </span>
                                </td>
                                <td className="text-center py-2 capitalize">
                                  {getColorForNumber(num)}
                                </td>
                                <td className="text-right py-2">
                                  ₨{bettingStats[duration]?.numbers[num.toString()]?.amount || 0}
                                </td>
                                <td className="text-right py-2 text-red-500">
                                  -₨{payout.toLocaleString()}
                                </td>
                                <td className={`text-right py-2 font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {profit >= 0 ? "+" : ""}₨{profit.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>
              • <strong>Real-time Stats:</strong> See how much money is bet on each color/number as users play.
            </p>
            <p>
              • <strong>AI Recommendation:</strong> Shows which number would result in lowest payout (best for house).
            </p>
            <p>
              • <strong>Manual Control:</strong> Click any number to set it as the next result.
            </p>
            <p>
              • <strong>5min game</strong> is typically used for giving predictions to members.
            </p>
            <p>
              • Once set, the control is used for the next completed round, then cleared.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default WingoControl;
