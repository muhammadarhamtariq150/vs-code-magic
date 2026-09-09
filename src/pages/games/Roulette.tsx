import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const NUMBERS = Array.from({ length: 37 }, (_, i) => i);
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

type BetType = "red" | "black" | "even" | "odd" | "1-18" | "19-36" | number;

const Roulette = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const getNumberColor = (num: number) => {
    if (num === 0) return "bg-green-600";
    return RED_NUMBERS.includes(num) ? "bg-red-600" : "bg-gray-900";
  };

  const spin = async () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (selectedBet === null) {
      toast.error("Place a bet first");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    const success = await updateBalance(balance - betAmount);
    if (!success) return;

    setSpinning(true);
    setResult(null);
    
    const winningNumber = Math.floor(Math.random() * 37);
    const newRotation = rotation + 1800 + (winningNumber * (360 / 37));
    setRotation(newRotation);

    setTimeout(async () => {
      setResult(winningNumber);
      setSpinning(false);

      let won = false;
      let multiplier = 0;

      if (typeof selectedBet === "number") {
        won = selectedBet === winningNumber;
        multiplier = 35;
      } else if (selectedBet === "red") {
        won = RED_NUMBERS.includes(winningNumber);
        multiplier = 2;
      } else if (selectedBet === "black") {
        won = winningNumber !== 0 && !RED_NUMBERS.includes(winningNumber);
        multiplier = 2;
      } else if (selectedBet === "even") {
        won = winningNumber !== 0 && winningNumber % 2 === 0;
        multiplier = 2;
      } else if (selectedBet === "odd") {
        won = winningNumber % 2 === 1;
        multiplier = 2;
      } else if (selectedBet === "1-18") {
        won = winningNumber >= 1 && winningNumber <= 18;
        multiplier = 2;
      } else if (selectedBet === "19-36") {
        won = winningNumber >= 19 && winningNumber <= 36;
        multiplier = 2;
      }

      if (won) {
        const winAmount = betAmount * multiplier;
        await updateBalance(balance - betAmount + winAmount);
        await recordTransaction("Roulette", betAmount, winAmount, "win");
        toast.success(`🎉 You won ₨${winAmount}!`);
      } else {
        await recordTransaction("Roulette", betAmount, 0, "loss");
        toast.error("Better luck next time!");
      }
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">Roulette</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-2xl mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Wheel */}
          <div className="relative w-48 h-48 mx-auto">
            <div 
              className="w-full h-full rounded-full border-8 border-amber-600 bg-gradient-conic from-red-600 via-gray-900 to-red-600 transition-transform duration-[3000ms] ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-amber-400" />
            {result !== null && !spinning && (
              <div className={`absolute inset-0 flex items-center justify-center`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${getNumberColor(result)}`}>
                  {result}
                </div>
              </div>
            )}
          </div>

          {/* Quick Bets */}
          <div className="grid grid-cols-3 gap-2">
            {(["red", "black", "even", "odd", "1-18", "19-36"] as const).map(bet => (
              <button
                key={bet}
                onClick={() => setSelectedBet(bet)}
                disabled={spinning}
                className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                  bet === "red" ? "bg-red-600 text-white" :
                  bet === "black" ? "bg-gray-900 text-white" :
                  "bg-muted text-foreground"
                } ${selectedBet === bet ? "ring-2 ring-primary" : ""} ${spinning ? "opacity-50" : "hover:opacity-80"}`}
              >
                {bet.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Number Grid */}
          <div className="grid grid-cols-6 gap-1">
            <button
              onClick={() => setSelectedBet(0)}
              disabled={spinning}
              className={`col-span-6 py-2 rounded bg-green-600 text-white font-bold ${
                selectedBet === 0 ? "ring-2 ring-primary" : ""
              } ${spinning ? "opacity-50" : "hover:opacity-80"}`}
            >
              0 (35x)
            </button>
            {NUMBERS.slice(1).map(num => (
              <button
                key={num}
                onClick={() => setSelectedBet(num)}
                disabled={spinning}
                className={`py-2 rounded text-white font-bold text-sm ${getNumberColor(num)} ${
                  selectedBet === num ? "ring-2 ring-primary" : ""
                } ${spinning ? "opacity-50" : "hover:opacity-80"}`}
              >
                {num}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={spinning}
              min={1}
            />
          </div>

          <Button onClick={spin} className="w-full" size="lg" disabled={spinning || selectedBet === null}>
            {spinning ? "Spinning..." : "Spin"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Roulette;
