import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const SEGMENTS = [
  { multiplier: 1, color: "bg-yellow-500", label: "1x" },
  { multiplier: 2, color: "bg-blue-500", label: "2x" },
  { multiplier: 1, color: "bg-yellow-500", label: "1x" },
  { multiplier: 3, color: "bg-green-500", label: "3x" },
  { multiplier: 1, color: "bg-yellow-500", label: "1x" },
  { multiplier: 2, color: "bg-blue-500", label: "2x" },
  { multiplier: 1, color: "bg-yellow-500", label: "1x" },
  { multiplier: 5, color: "bg-purple-500", label: "5x" },
  { multiplier: 1, color: "bg-yellow-500", label: "1x" },
  { multiplier: 2, color: "bg-blue-500", label: "2x" },
  { multiplier: 1, color: "bg-yellow-500", label: "1x" },
  { multiplier: 10, color: "bg-red-500", label: "10x" },
];

const WheelFortune = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ multiplier: number; label: string } | null>(null);

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
    if (!success) return;

    setSpinning(true);
    setResult(null);

    const segmentAngle = 360 / SEGMENTS.length;
    const winningIndex = Math.floor(Math.random() * SEGMENTS.length);
    const extraSpins = 5 * 360;
    const targetAngle = 360 - (winningIndex * segmentAngle) - (segmentAngle / 2);
    const newRotation = rotation + extraSpins + targetAngle + Math.random() * 20 - 10;
    
    setRotation(newRotation);

    setTimeout(async () => {
      const segment = SEGMENTS[winningIndex];
      setResult(segment);
      setSpinning(false);

      const winAmount = betAmount * segment.multiplier;
      await updateBalance(balance - betAmount + winAmount);
      
      if (segment.multiplier > 1) {
        await recordTransaction("Wheel of Fortune", betAmount, winAmount, "win");
        toast.success(`🎡 ${segment.label} - You won ₨${winAmount}!`);
      } else {
        await recordTransaction("Wheel of Fortune", betAmount, winAmount, "win");
        toast.info(`🎡 ${segment.label} - You got your bet back!`);
      }
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">Wheel of Fortune</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Wheel */}
          <div className="relative w-64 h-64 mx-auto">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-amber-400" 
              style={{ borderBottomWidth: "24px" }} />
            
            {/* Wheel */}
            <div 
              className="w-full h-full rounded-full border-8 border-amber-600 overflow-hidden transition-transform duration-[4000ms] ease-out"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {SEGMENTS.map((seg, i) => {
                  const angle = 360 / SEGMENTS.length;
                  const startAngle = i * angle - 90;
                  const endAngle = startAngle + angle;
                  const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const colors: { [key: string]: string } = {
                    "bg-yellow-500": "#eab308",
                    "bg-blue-500": "#3b82f6",
                    "bg-green-500": "#22c55e",
                    "bg-purple-500": "#a855f7",
                    "bg-red-500": "#ef4444",
                  };

                  return (
                    <path
                      key={i}
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={colors[seg.color]}
                      stroke="#000"
                      strokeWidth="0.5"
                    />
                  );
                })}
                {SEGMENTS.map((seg, i) => {
                  const angle = 360 / SEGMENTS.length;
                  const midAngle = i * angle + angle / 2 - 90;
                  const x = 50 + 30 * Math.cos((midAngle * Math.PI) / 180);
                  const y = 50 + 30 * Math.sin((midAngle * Math.PI) / 180);
                  
                  return (
                    <text
                      key={`text-${i}`}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="6"
                      fontWeight="bold"
                      transform={`rotate(${midAngle + 90}, ${x}, ${y})`}
                    >
                      {seg.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {result && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{result.label}</p>
              <p className="text-muted-foreground">Won ₨{betAmount * result.multiplier}</p>
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

          <Button onClick={spin} className="w-full" size="lg" disabled={spinning}>
            {spinning ? "Spinning..." : "Spin the Wheel"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WheelFortune;
