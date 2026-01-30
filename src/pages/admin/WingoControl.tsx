import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Gamepad2, Target, Clock, RefreshCw } from "lucide-react";

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
  const [activeRounds, setActiveRounds] = useState<Record<DurationType, WingoRound | null>>({
    "1min": null,
    "2min": null,
    "3min": null,
    "5min": null,
  });
  const [controls, setControls] = useState<AdminControl[]>([]);
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
  const fetchRounds = async () => {
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
  };

  // Fetch current admin controls
  const fetchControls = async () => {
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
        // Update selected numbers based on active controls
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
  };

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
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchRounds();
      fetchControls();
    }, 10000);

    return () => clearInterval(interval);
  }, [session]);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Wingo Game Control</h1>
            <p className="text-muted-foreground">
              Set next round results for predictions
            </p>
          </div>
          <Button onClick={processRounds} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Process Rounds
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DURATION_TYPES.map((duration) => {
            const round = activeRounds[duration];
            const time = timeLeft[duration];
            const activeControl = getActiveControl(duration);
            const selectedNum = selectedNumbers[duration];

            return (
              <Card key={duration} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5" />
                      {duration} Game
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono">
                        {String(time.minutes).padStart(2, "0")}:
                        {String(time.seconds).padStart(2, "0")}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Current Round Info */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Current Period</p>
                    <p className="font-mono font-bold text-primary">
                      {round?.period_id || "Loading..."}
                    </p>
                  </div>

                  {/* Active Control Status */}
                  {activeControl && (
                    <div className="bg-green-100 dark:bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 dark:text-green-400 font-medium">
                          Next result set to:
                        </span>
                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getColorClass(
                            activeControl.next_number
                          )}`}
                        >
                          {activeControl.next_number}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Number Selection */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Set next result (click to set):
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {NUMBERS.map((num) => (
                        <button
                          key={num}
                          onClick={() => setNextResult(duration, num)}
                          disabled={loading[duration]}
                          className={`w-full aspect-square rounded-full flex items-center justify-center text-lg font-bold text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${getColorClass(
                            num
                          )} ${
                            selectedNum === num
                              ? "ring-4 ring-primary ring-offset-2"
                              : ""
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Color Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    <Badge
                      variant="outline"
                      className="justify-center py-1 bg-green-500/20 border-green-500 text-green-600"
                    >
                      1,3,7,9 = GREEN
                    </Badge>
                    <Badge
                      variant="outline"
                      className="justify-center py-1 bg-purple-500/20 border-purple-500 text-purple-600"
                    >
                      0,5 = VIOLET
                    </Badge>
                    <Badge
                      variant="outline"
                      className="justify-center py-1 bg-red-500/20 border-red-500 text-red-600"
                    >
                      2,4,6,8 = RED
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>
              • Click on any number to set it as the next result for that game
              duration.
            </p>
            <p>
              • The control will be applied to the very next round that
              completes.
            </p>
            <p>
              • Once used, the control is cleared and the next round will be
              random unless you set a new number.
            </p>
            <p>
              • <strong>5min game</strong> is typically used for giving
              predictions to members.
            </p>
            <p>
              • Numbers 0 and 5 are VIOLET, even numbers (2,4,6,8) are RED, odd
              numbers (1,3,7,9) are GREEN.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default WingoControl;
