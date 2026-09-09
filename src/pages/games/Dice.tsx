import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

type BetType = "under" | "over" | "seven";

const Dice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);
  const [rolling, setRolling] = useState(false);
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [result, setResult] = useState<number | null>(null);

  const rollDice = async () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (!selectedBet) {
      toast.error("Select Under 7, Over 7, or Exactly 7");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    const success = await updateBalance(balance - betAmount);
    if (!success) return;

    setRolling(true);
    setResult(null);

    // Animation
    const rollInterval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(async () => {
      clearInterval(rollInterval);
      
      const finalDice1 = Math.floor(Math.random() * 6) + 1;
      const finalDice2 = Math.floor(Math.random() * 6) + 1;
      const total = finalDice1 + finalDice2;
      
      setDice1(finalDice1);
      setDice2(finalDice2);
      setResult(total);
      setRolling(false);

      let won = false;
      let multiplier = 0;

      if (selectedBet === "under" && total < 7) {
        won = true;
        multiplier = 2.3;
      } else if (selectedBet === "over" && total > 7) {
        won = true;
        multiplier = 2.3;
      } else if (selectedBet === "seven" && total === 7) {
        won = true;
        multiplier = 5.8;
      }

      if (won) {
        const winAmount = Math.floor(betAmount * multiplier);
        await updateBalance(balance - betAmount + winAmount);
        await recordTransaction("Dice", betAmount, winAmount, "win");
        toast.success(`🎲 You won ₨${winAmount}! Total: ${total}`);
      } else {
        await recordTransaction("Dice", betAmount, 0, "loss");
        toast.error(`Total: ${total}. Better luck next time!`);
      }
    }, 1500);
  };

  const getDiceFace = (value: number) => {
    const dots: { [key: number]: string } = {
      1: "⚀",
      2: "⚁",
      3: "⚂",
      4: "⚃",
      5: "⚄",
      6: "⚅",
    };
    return dots[value];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">Under & Over 7</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Dice Display */}
          <div className="flex justify-center gap-4">
            <div className={`text-8xl ${rolling ? "animate-bounce" : ""}`}>
              {getDiceFace(dice1)}
            </div>
            <div className={`text-8xl ${rolling ? "animate-bounce" : ""}`} style={{ animationDelay: "0.1s" }}>
              {getDiceFace(dice2)}
            </div>
          </div>

          {result !== null && (
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">Total: {result}</p>
            </div>
          )}

          {/* Bet Options */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">Select Your Bet</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedBet("under")}
                disabled={rolling}
                className={`py-4 rounded-xl font-bold text-white bg-blue-600 transition-all ${
                  selectedBet === "under" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                } ${rolling ? "opacity-50" : "hover:opacity-80"}`}
              >
                <div>Under 7</div>
                <div className="text-xs opacity-80">2.3x</div>
              </button>
              <button
                onClick={() => setSelectedBet("seven")}
                disabled={rolling}
                className={`py-4 rounded-xl font-bold text-white bg-amber-500 transition-all ${
                  selectedBet === "seven" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                } ${rolling ? "opacity-50" : "hover:opacity-80"}`}
              >
                <div>Exactly 7</div>
                <div className="text-xs opacity-80">5.8x</div>
              </button>
              <button
                onClick={() => setSelectedBet("over")}
                disabled={rolling}
                className={`py-4 rounded-xl font-bold text-white bg-green-600 transition-all ${
                  selectedBet === "over" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                } ${rolling ? "opacity-50" : "hover:opacity-80"}`}
              >
                <div>Over 7</div>
                <div className="text-xs opacity-80">2.3x</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={rolling}
              min={1}
            />
          </div>

          <Button onClick={rollDice} className="w-full" size="lg" disabled={rolling || !selectedBet}>
            <Dices className="w-5 h-5 mr-2" />
            {rolling ? "Rolling..." : "Roll Dice"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dice;
