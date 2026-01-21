import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plane, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const Aviator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isFlying, setIsFlying] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [history, setHistory] = useState<number[]>([2.35, 1.42, 5.67, 1.12, 3.45]);
  const crashPointRef = useRef(0);
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
    if (!success) {
      toast.error("Failed to place bet");
      return;
    }

    setBetPlaced(true);
    setHasCashedOut(false);
    setCrashed(false);
    setMultiplier(1.0);

    // Generate random crash point (weighted towards lower values)
    crashPointRef.current = 1 + Math.random() * Math.random() * 10;
    
    // Start countdown then fly
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsFlying(true);
    
    intervalRef.current = setInterval(() => {
      setMultiplier(prev => {
        const newMult = prev + 0.01 + (prev * 0.005);
        
        if (newMult >= crashPointRef.current) {
          clearInterval(intervalRef.current!);
          handleCrash();
          return crashPointRef.current;
        }
        
        return Number(newMult.toFixed(2));
      });
    }, 50);
  };

  const handleCrash = async () => {
    setIsFlying(false);
    setCrashed(true);
    setBetPlaced(false);
    
    setHistory(prev => [crashPointRef.current, ...prev.slice(0, 9)]);
    
    if (!hasCashedOut) {
      await recordTransaction("Aviator", betAmount, 0, "loss");
      toast.error(`💥 Crashed at ${crashPointRef.current.toFixed(2)}x!`);
    }
  };

  const cashOut = async () => {
    if (!isFlying || hasCashedOut) return;
    
    clearInterval(intervalRef.current!);
    setHasCashedOut(true);
    setIsFlying(false);
    setBetPlaced(false);
    
    const winAmount = betAmount * multiplier;
    await updateBalance(balance + winAmount);
    await recordTransaction("Aviator", betAmount, winAmount, "win");
    toast.success(`✈️ Cashed out at ${multiplier.toFixed(2)}x! Won ₨${winAmount.toFixed(2)}!`);
  };

  const resetGame = () => {
    setMultiplier(1.0);
    setIsFlying(false);
    setHasCashedOut(false);
    setCrashed(false);
    setBetPlaced(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-red-500 flex items-center gap-2">
          <Plane className="w-5 h-5" />
          Aviator
        </h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-lg mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Game Display */}
          <div className="relative bg-gradient-to-t from-gray-900 to-gray-800 rounded-xl h-64 overflow-hidden">
            {/* Curve Path */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={`M 0 100 Q ${Math.min(multiplier * 10, 50)} ${100 - Math.min(multiplier * 15, 80)} ${Math.min(multiplier * 20, 100)} ${100 - Math.min(multiplier * 20, 95)}`}
                fill="none"
                stroke="rgba(239, 68, 68, 0.5)"
                strokeWidth="2"
              />
            </svg>

            {/* Plane */}
            <div 
              className={`absolute transition-all duration-100 ${crashed ? "opacity-0" : ""}`}
              style={{
                left: `${Math.min(multiplier * 15, 70)}%`,
                bottom: `${Math.min(multiplier * 15, 80)}%`,
              }}
            >
              <Plane className={`w-8 h-8 text-red-500 -rotate-45 ${isFlying ? "animate-pulse" : ""}`} />
            </div>

            {/* Multiplier Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-5xl font-bold ${crashed ? "text-red-500" : hasCashedOut ? "text-green-500" : "text-white"}`}>
                {crashed ? "CRASHED!" : `${multiplier.toFixed(2)}x`}
              </div>
            </div>

            {/* Crash explosion */}
            {crashed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl animate-ping">💥</div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="flex gap-2 justify-center overflow-x-auto">
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

          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={betPlaced}
              min={1}
            />
          </div>

          {!betPlaced && !crashed ? (
            <Button 
              onClick={startGame} 
              className="w-full bg-green-600 hover:bg-green-700" 
              size="lg"
            >
              Place Bet & Start
            </Button>
          ) : isFlying && !hasCashedOut ? (
            <Button 
              onClick={cashOut} 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" 
              size="lg"
            >
              Cash Out ₨{(betAmount * multiplier).toFixed(2)}
            </Button>
          ) : (
            <Button 
              onClick={resetGame} 
              variant="outline" 
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Cash out before the plane crashes! The longer you wait, the higher the multiplier.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Aviator;
