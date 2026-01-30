import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type DurationType = "1min" | "2min" | "3min" | "5min";

interface WingoRound {
  id: string;
  period_id: string;
  duration_type: string;
  status: string;
  end_time: string;
  winning_number?: number;
  winning_color?: string;
  winning_size?: string;
}

interface HistoryItem {
  period_id: string;
  winning_number: number;
  winning_color: string;
  winning_size: string;
}

const DURATION_TABS: { key: DurationType; label: string }[] = [
  { key: "1min", label: "1min" },
  { key: "2min", label: "2min" },
  { key: "3min", label: "3min" },
  { key: "5min", label: "5min" },
];

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const BET_AMOUNTS = [10, 100, 1000, 10000];

const getColorForNumber = (num: number): string => {
  if (num === 0 || num === 5) return "violet";
  if (num % 2 === 0) return "red";
  return "green";
};

const getNumberBgClass = (num: number): string => {
  const color = getColorForNumber(num);
  if (color === "violet") return "bg-gradient-to-br from-purple-500 to-red-500";
  if (color === "red") return "bg-red-500";
  return "bg-green-500";
};

const getColorBgClass = (color: string): string => {
  if (color === "violet") return "bg-purple-600";
  if (color === "red") return "bg-red-500";
  return "bg-green-500";
};

const Wingo = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { balance, refreshBalance } = useWallet();

  const [activeDuration, setActiveDuration] = useState<DurationType>("1min");
  const [currentRound, setCurrentRound] = useState<WingoRound | null>(null);
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1);
  const [selectedBet, setSelectedBet] = useState<{ type: string; value: string } | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [showBetModal, setShowBetModal] = useState(false);

  // Fetch current round
  const fetchRound = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wingo?action=get-round&duration=${activeDuration}`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      
      const result = await response.json();
      if (result.round) {
        setCurrentRound(result.round);
      }
    } catch (error) {
      console.error("Error fetching round:", error);
    }
  }, [activeDuration]);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wingo?action=get-history&duration=${activeDuration}&limit=20`,
        {
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      
      const result = await response.json();
      if (result.history) {
        setHistory(result.history);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  }, [activeDuration]);

  // Initialize
  useEffect(() => {
    fetchRound();
    fetchHistory();
  }, [activeDuration, fetchRound, fetchHistory]);

  // Timer countdown
  useEffect(() => {
    if (!currentRound) return;

    const updateTimer = () => {
      const endTime = new Date(currentRound.end_time).getTime();
      const now = Date.now();
      const diff = Math.max(0, endTime - now);

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft({ minutes, seconds });

      // If round ended, fetch new round
      if (diff <= 0) {
        setTimeout(() => {
          fetchRound();
          fetchHistory();
          refreshBalance();
        }, 2000);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentRound, fetchRound, fetchHistory, refreshBalance]);

  // Real-time subscription for round updates
  useEffect(() => {
    const channel = supabase
      .channel("wingo-rounds")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wingo_rounds",
          filter: `duration_type=eq.${activeDuration}`,
        },
        () => {
          fetchRound();
          fetchHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeDuration, fetchRound, fetchHistory]);

  const openBetModal = (type: string, value: string) => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (timeLeft.minutes === 0 && timeLeft.seconds < 10) {
      toast.error("Betting closed for this round");
      return;
    }
    setSelectedBet({ type, value });
    setShowBetModal(true);
  };

  const placeBet = async () => {
    if (!user || !session || !currentRound || !selectedBet) return;

    const totalBet = betAmount * multiplier;
    if (totalBet > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsPlacingBet(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wingo?action=place-bet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            roundId: currentRound.id,
            betType: selectedBet.type,
            betValue: selectedBet.value,
            amount: totalBet,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success(`Bet placed: ₨${totalBet} on ${selectedBet.value.toUpperCase()}`);
        refreshBalance();
        setShowBetModal(false);
        setSelectedBet(null);
      } else {
        toast.error(result.error || "Failed to place bet");
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      toast.error("Failed to place bet");
    } finally {
      setIsPlacingBet(false);
    }
  };

  const isBettingClosed = timeLeft.minutes === 0 && timeLeft.seconds < 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-500">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-white hover:bg-white/20">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">Win</h1>
        <Button variant="ghost" size="sm" className="text-yellow-300 hover:bg-white/20">
          <History className="w-5 h-5 mr-1" />
          Bet Records
        </Button>
      </div>

      {/* Duration Tabs */}
      <div className="flex justify-center gap-2 px-4 py-2">
        {DURATION_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveDuration(tab.key)}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeDuration === tab.key
                ? "bg-white text-sky-600 shadow-lg"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Balance & Timer Card */}
      <div className="mx-4 mt-4 bg-sky-600/50 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/70 text-sm">My Balance:</p>
            <p className="text-white text-2xl font-bold">₨ {balance.toFixed(2)}</p>
            <p className="text-white/70 text-sm mt-2">Period</p>
            <p className="text-green-300 font-mono font-bold text-lg">
              {currentRound?.period_id || "Loading..."}
            </p>
          </div>
          <div className="text-right">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                Deposit
              </Button>
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                Rule
              </Button>
            </div>
            {/* Timer */}
            <div className="flex gap-1 mt-2">
              <div className="bg-gray-800 text-white px-3 py-2 rounded font-mono text-xl font-bold">
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <span className="text-white text-xl font-bold">:</span>
              <div className="bg-gray-800 text-white px-3 py-2 rounded font-mono text-xl font-bold">
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Numbers Grid */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4">
        <div className="grid grid-cols-5 gap-3">
          {NUMBERS.map((num) => (
            <button
              key={num}
              onClick={() => openBetModal("number", String(num))}
              disabled={isBettingClosed}
              className={`w-full aspect-square rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 ${getNumberBgClass(num)}`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Color Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <button
            onClick={() => openBetModal("color", "green")}
            disabled={isBettingClosed}
            className="py-3 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition-all disabled:opacity-50"
          >
            GREEN
          </button>
          <button
            onClick={() => openBetModal("color", "violet")}
            disabled={isBettingClosed}
            className="py-3 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            VIOLET
          </button>
          <button
            onClick={() => openBetModal("color", "red")}
            disabled={isBettingClosed}
            className="py-3 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
          >
            RED
          </button>
        </div>

        {/* Size Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={() => openBetModal("size", "big")}
            disabled={isBettingClosed}
            className="py-3 rounded-lg font-bold text-white bg-orange-400 hover:bg-orange-500 transition-all disabled:opacity-50"
          >
            Big
          </button>
          <button
            onClick={() => openBetModal("size", "small")}
            disabled={isBettingClosed}
            className="py-3 rounded-lg font-bold text-white bg-teal-400 hover:bg-teal-500 transition-all disabled:opacity-50"
          >
            Small
          </button>
        </div>

        {isBettingClosed && (
          <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-lg text-center font-medium">
            Betting closed - waiting for result...
          </div>
        )}
      </div>

      {/* History */}
      <div className="mx-4 mt-4 bg-white rounded-xl p-4 mb-24">
        <h3 className="font-bold text-gray-800 mb-3">Record</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-2">Period</th>
                <th className="text-center py-2">Number</th>
                <th className="text-center py-2">Big/Small</th>
                <th className="text-center py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 text-gray-600 font-mono text-xs">{item.period_id}</td>
                  <td className="py-2 text-center">
                    <span className={`inline-block w-6 h-6 rounded-full text-white text-xs font-bold leading-6 ${getColorBgClass(item.winning_color)}`}>
                      {item.winning_number}
                    </span>
                  </td>
                  <td className="py-2 text-center text-gray-600 uppercase text-xs">
                    {item.winning_size}
                  </td>
                  <td className="py-2 text-center">
                    <div className="flex justify-center gap-1">
                      <span className={`w-4 h-4 rounded-full ${getColorBgClass(item.winning_color)}`} />
                      {(item.winning_number === 0 || item.winning_number === 5) && (
                        <span className={`w-4 h-4 rounded-full ${item.winning_number === 0 ? "bg-red-500" : "bg-green-500"}`} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No results yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bet Modal */}
      {showBetModal && selectedBet && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setShowBetModal(false)}>
          <div 
            className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Place Bet: <span className={`uppercase ${
                  selectedBet.value === "green" ? "text-green-500" :
                  selectedBet.value === "red" ? "text-red-500" :
                  selectedBet.value === "violet" ? "text-purple-600" :
                  "text-gray-800"
                }`}>{selectedBet.value}</span>
              </h3>
              <button onClick={() => setShowBetModal(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>

            {/* Bet Amount Selection */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Contract Money</p>
              <div className="grid grid-cols-4 gap-2">
                {BET_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className={`py-2 rounded-lg font-medium transition-all ${
                      betAmount === amount
                        ? "bg-sky-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Multiplier</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMultiplier(Math.max(1, multiplier - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold"
                >
                  -
                </button>
                <span className="text-xl font-bold w-12 text-center">{multiplier}</span>
                <button
                  onClick={() => setMultiplier(multiplier + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bet:</span>
                <span className="font-bold text-lg">₨ {(betAmount * multiplier).toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm Button */}
            <Button
              onClick={placeBet}
              disabled={isPlacingBet || betAmount * multiplier > balance}
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600"
            >
              {isPlacingBet ? "Placing Bet..." : `Confirm Bet ₨${(betAmount * multiplier).toFixed(2)}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wingo;
