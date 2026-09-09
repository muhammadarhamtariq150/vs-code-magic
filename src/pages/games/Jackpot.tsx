import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const SYMBOLS = ["💎", "👑", "💰", "🏆", "⭐", "🎯"];

const Jackpot = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [jackpotAmount, setJackpotAmount] = useState(10000);
  const [reels, setReels] = useState<string[][]>([
    ["💎", "👑", "💰"],
    ["💎", "👑", "💰"],
    ["💎", "👑", "💰"],
    ["💎", "👑", "💰"],
    ["💎", "👑", "💰"],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpotAmount(prev => prev + Math.random() * 10);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
    setJackpotAmount(prev => prev + betAmount * 0.1);

    let spins = 0;
    const spinInterval = setInterval(() => {
      setReels(prev => prev.map(() => 
        Array(3).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
      ));
      spins++;
      if (spins > 20) {
        clearInterval(spinInterval);
        finishSpin();
      }
    }, 100);
  };

  const finishSpin = async () => {
    const finalReels = Array(5).fill(null).map(() =>
      Array(3).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    );
    setReels(finalReels);
    setSpinning(false);

    // Check middle row for matches
    const middleRow = finalReels.map(reel => reel[1]);
    const allSame = middleRow.every(s => s === middleRow[0]);
    const pairs = middleRow.filter((s, i) => middleRow.indexOf(s) !== i).length;

    if (allSame && middleRow[0] === "💎") {
      // JACKPOT!
      const winAmount = jackpotAmount;
      await updateBalance(balance + winAmount);
      await recordTransaction("Jackpot", betAmount, winAmount, "jackpot");
      setLastWin(winAmount);
      setJackpotAmount(10000);
      toast.success(`🎰🎰🎰 JACKPOT!!! You won ₨${winAmount.toFixed(0)}! 🎰🎰🎰`);
    } else if (allSame) {
      const winAmount = betAmount * 50;
      await updateBalance(balance + winAmount);
      await recordTransaction("Jackpot", betAmount, winAmount, "win");
      setLastWin(winAmount);
      toast.success(`👑 5 of a kind! You won ₨${winAmount}!`);
    } else if (pairs >= 3) {
      const winAmount = betAmount * 5;
      await updateBalance(balance + winAmount);
      await recordTransaction("Jackpot", betAmount, winAmount, "win");
      setLastWin(winAmount);
      toast.success(`Nice! You won ₨${winAmount}!`);
    } else if (pairs >= 2) {
      const winAmount = betAmount * 2;
      await updateBalance(balance + winAmount);
      await recordTransaction("Jackpot", betAmount, winAmount, "win");
      setLastWin(winAmount);
      toast.success(`Small win! ₨${winAmount}`);
    } else {
      await recordTransaction("Jackpot", betAmount, 0, "loss");
      toast.error("No luck this time!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Jackpot
        </h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-lg mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Jackpot Display */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 text-black">
              <Sparkles className="w-6 h-6" />
              <span className="text-sm font-bold">PROGRESSIVE JACKPOT</span>
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-black">₨{jackpotAmount.toFixed(0)}</p>
          </div>

          {/* Reels */}
          <div className="bg-gradient-to-b from-purple-900/50 to-purple-950/50 p-4 rounded-xl border-4 border-purple-500/50 overflow-hidden">
            <div className="flex justify-center gap-1">
              {reels.map((reel, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {reel.map((symbol, j) => (
                    <div
                      key={j}
                      className={`w-12 h-12 bg-card rounded flex items-center justify-center text-2xl ${
                        spinning ? "animate-pulse" : ""
                      } ${j === 1 ? "ring-2 ring-yellow-500" : "opacity-50"}`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="text-center mt-2 text-xs text-muted-foreground">
              ← Middle row pays →
            </div>
          </div>

          {lastWin !== null && (
            <div className="text-center p-4 bg-green-500/20 rounded-lg animate-pulse">
              <p className="text-2xl font-bold text-green-500">WON ₨{lastWin.toFixed(0)}!</p>
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

          <Button 
            onClick={spin} 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500" 
            size="lg" 
            disabled={spinning}
          >
            {spinning ? "Spinning..." : "🎰 SPIN FOR JACKPOT 🎰"}
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            <p>5x 💎 = JACKPOT! | 5 Match = 50x | 3+ Match = 5x | 2 Match = 2x</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jackpot;
