import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const Crash = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [multiplier, setMultiplier] = useState(1.00);
  const [isFlying, setIsFlying] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  
  const crashPointRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = async () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    const success = await updateBalance(balance - betAmount);
    if (!success) return;

    setBetPlaced(true);
    setIsFlying(true);
    setHasCashedOut(false);
    setCrashed(false);
    setMultiplier(1.00);

    // Generate crash point (house edge ~4%)
    const r = Math.random();
    crashPointRef.current = Math.max(1.0, (1 / (1 - r * 0.96)));

    intervalRef.current = setInterval(() => {
      setMultiplier(prev => {
        const next = prev + 0.02;
        if (next >= crashPointRef.current) {
          handleCrash();
          return crashPointRef.current;
        }
        return parseFloat(next.toFixed(2));
      });
    }, 50);
  };

  const handleCrash = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsFlying(false);
    setCrashed(true);
    setHistory(prev => [parseFloat(crashPointRef.current.toFixed(2)), ...prev.slice(0, 9)]);

    if (!hasCashedOut) {
      await recordTransaction("Crash", betAmount, 0, "loss");
      toast.error(`💥 Crashed at ${crashPointRef.current.toFixed(2)}x!`);
    }
  };

  const cashOut = async () => {
    if (!isFlying || hasCashedOut) return;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    setHasCashedOut(true);
    setIsFlying(false);

    const winAmount = Math.floor(betAmount * multiplier);
    await updateBalance(balance - betAmount + winAmount);
    await recordTransaction("Crash", betAmount, winAmount, "win");
    toast.success(`🚀 Cashed out at ${multiplier.toFixed(2)}x! Won ₨${winAmount}`);
  };

  const resetGame = () => {
    setBetPlaced(false);
    setCrashed(false);
    setHasCashedOut(false);
    setMultiplier(1.00);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const getMultiplierColor = () => {
    if (crashed) return "text-red-500";
    if (hasCashedOut) return "text-green-500";
    if (multiplier >= 5) return "text-purple-500";
    if (multiplier >= 2) return "text-amber-500";
    return "text-primary";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">Crash</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Game Area */}
          <div className="relative h-48 bg-gradient-to-t from-muted/50 to-transparent rounded-lg overflow-hidden">
            {/* Stars */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-50"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            {/* Rocket */}
            <div 
              className={`absolute transition-all duration-100 ${
                isFlying ? "animate-pulse" : ""
              }`}
              style={{
                left: "50%",
                bottom: isFlying || hasCashedOut ? `${Math.min((multiplier - 1) * 30, 80)}%` : crashed ? "10%" : "20%",
                transform: `translateX(-50%) ${crashed ? "rotate(180deg)" : "rotate(-45deg)"}`,
              }}
            >
              <Rocket className={`w-12 h-12 ${crashed ? "text-red-500" : "text-amber-400"}`} />
              {isFlying && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-8 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full animate-pulse" />
              )}
            </div>

            {/* Multiplier Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-5xl font-bold ${getMultiplierColor()}`}>
                {multiplier.toFixed(2)}x
              </div>
            </div>

            {crashed && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                <span className="text-2xl font-bold text-red-500">CRASHED!</span>
              </div>
            )}

            {hasCashedOut && !crashed && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                <span className="text-2xl font-bold text-green-500">CASHED OUT!</span>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="flex gap-1 flex-wrap justify-center">
              {history.map((h, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    h >= 2 ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {h.toFixed(2)}x
                </span>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={isFlying || betPlaced}
              min={1}
            />
          </div>

          {!betPlaced ? (
            <Button onClick={startGame} className="w-full" size="lg">
              <Rocket className="w-5 h-5 mr-2" />
              Place Bet & Launch
            </Button>
          ) : isFlying ? (
            <Button onClick={cashOut} className="w-full bg-green-600 hover:bg-green-700" size="lg">
              Cash Out ({(betAmount * multiplier).toFixed(0)})
            </Button>
          ) : (
            <Button onClick={resetGame} className="w-full" size="lg">
              Play Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Crash;
