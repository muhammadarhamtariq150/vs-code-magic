import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Circle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const MULTIPLIERS = [10, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 10];
const ROWS = 10;

const Plinko = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number } | null>(null);
  const [dropping, setDropping] = useState(false);
  const [lastWin, setLastWin] = useState<{ multiplier: number; amount: number } | null>(null);

  const dropBall = async () => {
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

    setDropping(true);
    setLastWin(null);
    
    let x = 50; // Start at center
    let y = 0;

    // Simulate ball dropping through pegs
    for (let row = 0; row < ROWS; row++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Random bounce left or right
      const bounce = Math.random() > 0.5 ? 4 : -4;
      x = Math.max(5, Math.min(95, x + bounce));
      y = ((row + 1) / ROWS) * 100;
      
      setBallPosition({ x, y });
    }

    // Determine final bucket
    const bucketIndex = Math.min(
      MULTIPLIERS.length - 1,
      Math.floor((x / 100) * MULTIPLIERS.length)
    );
    const multiplier = MULTIPLIERS[bucketIndex];
    const winAmount = betAmount * multiplier;

    await new Promise(resolve => setTimeout(resolve, 300));
    setBallPosition(null);
    setDropping(false);
    setLastWin({ multiplier, amount: winAmount });

    if (multiplier >= 1) {
      await updateBalance(balance + winAmount);
      await recordTransaction("Plinko", betAmount, winAmount, "win");
      toast.success(`🎯 ${multiplier}x! You won ₨${winAmount.toFixed(2)}!`);
    } else {
      const returned = winAmount;
      await updateBalance(balance + returned);
      await recordTransaction("Plinko", betAmount, returned, "partial");
      toast.info(`${multiplier}x - Returned ₨${returned.toFixed(2)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">PLINKO</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-lg mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Plinko Board */}
          <div className="relative bg-gradient-to-b from-purple-900/50 to-blue-900/50 rounded-xl p-4 aspect-square">
            {/* Pegs */}
            {Array.from({ length: ROWS }).map((_, row) => (
              <div 
                key={row} 
                className="flex justify-center gap-4"
                style={{ marginTop: row === 0 ? 0 : "1rem" }}
              >
                {Array.from({ length: row + 3 }).map((_, peg) => (
                  <div 
                    key={peg}
                    className="w-2 h-2 bg-white rounded-full opacity-60"
                  />
                ))}
              </div>
            ))}

            {/* Ball */}
            {ballPosition && (
              <div 
                className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500/50 transition-all duration-150"
                style={{ 
                  left: `${ballPosition.x}%`,
                  top: `${ballPosition.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
              />
            )}

            {/* Multiplier buckets */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {MULTIPLIERS.map((mult, i) => (
                <div 
                  key={i}
                  className={`flex-1 py-2 text-center text-xs font-bold rounded-t ${
                    mult >= 3 ? "bg-green-500 text-white" :
                    mult >= 1 ? "bg-yellow-500 text-black" :
                    "bg-red-500 text-white"
                  }`}
                >
                  {mult}x
                </div>
              ))}
            </div>
          </div>

          {lastWin && (
            <div className={`text-center p-4 rounded-lg ${lastWin.multiplier >= 1 ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
              <p className="text-lg font-bold">
                {lastWin.multiplier}x - ₨{lastWin.amount.toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={dropping}
              min={1}
            />
          </div>

          <Button 
            onClick={dropBall} 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500" 
            size="lg" 
            disabled={dropping}
          >
            {dropping ? "Dropping..." : "🎯 Drop Ball"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Plinko;
