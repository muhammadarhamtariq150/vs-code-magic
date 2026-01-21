import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Timer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const COLORS = ["green", "violet", "red"];
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const Wingo = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [result, setResult] = useState<{ number: number; color: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<{ number: number; color: string }[]>([]);

  const getColor = (num: number) => {
    if (num === 0) return "violet";
    if (num === 5) return "violet";
    return num % 2 === 0 ? "red" : "green";
  };

  const placeBet = async () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (!selectedColor && selectedNumber === null) {
      toast.error("Select a color or number");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    const success = await updateBalance(balance - betAmount);
    if (!success) {
      toast.error("Failed to place bet");
      return;
    }

    setIsPlaying(true);
    setResult(null);
    setTimeLeft(30);

    // Countdown
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          revealResult();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const revealResult = async () => {
    const winningNumber = Math.floor(Math.random() * 10);
    const winningColor = getColor(winningNumber);
    
    setResult({ number: winningNumber, color: winningColor });
    setHistory(prev => [{ number: winningNumber, color: winningColor }, ...prev.slice(0, 9)]);

    let won = false;
    let winAmount = 0;

    if (selectedNumber !== null && selectedNumber === winningNumber) {
      winAmount = betAmount * 9;
      won = true;
    } else if (selectedColor && selectedColor === winningColor) {
      winAmount = selectedColor === "violet" ? betAmount * 4.5 : betAmount * 2;
      won = true;
    }

    if (won) {
      await updateBalance(balance + winAmount);
      await recordTransaction("Wingo", betAmount, winAmount, "win");
      toast.success(`🎉 You won ₨${winAmount.toFixed(2)}!`);
    } else {
      await recordTransaction("Wingo", betAmount, 0, "loss");
      toast.error("Better luck next time!");
    }

    setIsPlaying(false);
    setSelectedColor(null);
    setSelectedNumber(null);
  };

  const colorClass = (color: string) => {
    switch (color) {
      case "green": return "bg-green-500";
      case "red": return "bg-red-500";
      case "violet": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">Wingo</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Timer */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isPlaying ? "bg-red-500/20" : "bg-muted"}`}>
              <Timer className="w-5 h-5" />
              <span className="text-2xl font-bold">{timeLeft}s</span>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Result</p>
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold text-white ${colorClass(result.color)}`}>
                {result.number}
              </div>
            </div>
          )}

          {/* Color Selection */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Select Color (2x / Violet 4.5x)</p>
            <div className="grid grid-cols-3 gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => !isPlaying && (setSelectedColor(color), setSelectedNumber(null))}
                  disabled={isPlaying}
                  className={`py-3 rounded-lg font-bold text-white capitalize transition-all ${colorClass(color)} ${
                    selectedColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""
                  } ${isPlaying ? "opacity-50" : "hover:opacity-80"}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Number Selection */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Or Select Number (9x)</p>
            <div className="grid grid-cols-5 gap-2">
              {NUMBERS.map(num => (
                <button
                  key={num}
                  onClick={() => !isPlaying && (setSelectedNumber(num), setSelectedColor(null))}
                  disabled={isPlaying}
                  className={`py-3 rounded-lg font-bold text-white ${colorClass(getColor(num))} ${
                    selectedNumber === num ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""
                  } ${isPlaying ? "opacity-50" : "hover:opacity-80"}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={isPlaying}
              min={1}
            />
          </div>

          <Button 
            onClick={placeBet} 
            className="w-full" 
            size="lg" 
            disabled={isPlaying || (!selectedColor && selectedNumber === null)}
          >
            {isPlaying ? `Waiting... ${timeLeft}s` : "Place Bet"}
          </Button>

          {/* History */}
          {history.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Recent Results</p>
              <div className="flex gap-1 flex-wrap">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${colorClass(h.color)}`}
                  >
                    {h.number}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wingo;
