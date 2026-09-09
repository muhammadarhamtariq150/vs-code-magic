import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const SYMBOLS = ["💕", "💖", "💗", "💝", "💘", "❤️", "💎"];
const PAYOUTS: Record<string, number> = {
  "💕": 2,
  "💖": 3,
  "💗": 4,
  "💝": 5,
  "💘": 8,
  "❤️": 15,
  "💎": 50,
};

const LoveSlots = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [reels, setReels] = useState<string[]>(["❤️", "❤️", "❤️"]);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const spin = async () => {
    if (!user) {
      toast.error("Please login to play");
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

    setSpinning(true);
    setLastWin(null);

    let spins = 0;
    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      spins++;
      if (spins > 20) {
        clearInterval(spinInterval);
        finishSpin();
      }
    }, 100);
  };

  const finishSpin = async () => {
    const finalReels = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];
    setReels(finalReels);
    setSpinning(false);

    if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
      const winAmount = betAmount * PAYOUTS[finalReels[0]];
      await updateBalance(balance + winAmount);
      await recordTransaction("Love Slots", betAmount, winAmount, "win");
      setLastWin(winAmount);
      toast.success(`💖 LOVE JACKPOT! You won ₨${winAmount}!`);
    } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2]) {
      const matchSymbol = finalReels[0] === finalReels[1] ? finalReels[0] : finalReels[1];
      const winAmount = betAmount * (PAYOUTS[matchSymbol] / 4);
      await updateBalance(balance + winAmount);
      await recordTransaction("Love Slots", betAmount, winAmount, "win");
      setLastWin(winAmount);
      toast.success(`💕 Match! You won ₨${winAmount}!`);
    } else {
      await recordTransaction("Love Slots", betAmount, 0, "loss");
      toast.error("No match. Try again!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-pink-500 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Love Slots
        </h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-pink-500/30 space-y-6">
          <div className="bg-gradient-to-b from-pink-500/20 to-red-500/20 p-6 rounded-xl border-4 border-pink-500/50">
            <div className="flex justify-center gap-2">
              {reels.map((symbol, i) => (
                <div
                  key={i}
                  className={`w-20 h-24 bg-card rounded-lg border-2 border-pink-500/30 flex items-center justify-center text-4xl ${spinning ? "animate-pulse" : ""}`}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>

          {lastWin !== null && (
            <div className="text-center p-4 bg-pink-500/20 rounded-lg">
              <p className="text-2xl font-bold text-pink-500">Won ₨{lastWin}!</p>
            </div>
          )}

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

          <Button onClick={spin} className="w-full bg-pink-500 hover:bg-pink-600" size="lg" disabled={spinning}>
            {spinning ? "Spinning..." : "💕 SPIN 💕"}
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>3 Match Payouts:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(PAYOUTS).map(([symbol, payout]) => (
                <span key={symbol}>{symbol} {payout}x</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoveSlots;
