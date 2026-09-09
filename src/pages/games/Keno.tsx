import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const NUMBERS = Array.from({ length: 40 }, (_, i) => i + 1);
const MAX_PICKS = 10;

const PAYOUTS: { [key: number]: { [key: number]: number } } = {
  1: { 1: 3.5 },
  2: { 2: 8 },
  3: { 2: 2, 3: 25 },
  4: { 2: 1, 3: 5, 4: 50 },
  5: { 3: 2, 4: 10, 5: 100 },
  6: { 3: 1, 4: 5, 5: 25, 6: 250 },
  7: { 4: 2, 5: 10, 6: 50, 7: 500 },
  8: { 4: 1, 5: 5, 6: 25, 7: 100, 8: 1000 },
  9: { 5: 2, 6: 10, 7: 50, 8: 250, 9: 2000 },
  10: { 5: 1, 6: 5, 7: 25, 8: 100, 9: 500, 10: 5000 },
};

const Keno = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [matches, setMatches] = useState<number[]>([]);

  const toggleNumber = (num: number) => {
    if (drawing) return;
    
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < MAX_PICKS) {
      setSelectedNumbers([...selectedNumbers, num]);
    } else {
      toast.error(`Maximum ${MAX_PICKS} numbers allowed`);
    }
  };

  const quickPick = () => {
    if (drawing) return;
    const shuffled = [...NUMBERS].sort(() => Math.random() - 0.5);
    setSelectedNumbers(shuffled.slice(0, 5));
  };

  const draw = async () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (selectedNumbers.length === 0) {
      toast.error("Select at least 1 number");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    const success = await updateBalance(balance - betAmount);
    if (!success) return;

    setDrawing(true);
    setDrawnNumbers([]);
    setMatches([]);

    // Draw 10 numbers
    const shuffled = [...NUMBERS].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, 10);

    // Animate drawing
    for (let i = 0; i < drawn.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setDrawnNumbers(prev => [...prev, drawn[i]]);
    }

    // Calculate matches
    const matchedNums = selectedNumbers.filter(n => drawn.includes(n));
    setMatches(matchedNums);
    setDrawing(false);

    const picks = selectedNumbers.length;
    const matchCount = matchedNums.length;
    const payoutTable = PAYOUTS[picks];
    const multiplier = payoutTable?.[matchCount] || 0;

    if (multiplier > 0) {
      const winAmount = betAmount * multiplier;
      await updateBalance(balance - betAmount + winAmount);
      await recordTransaction("Keno", betAmount, winAmount, "win");
      toast.success(`🎯 ${matchCount} matches! You won ₨${winAmount}!`);
    } else {
      await recordTransaction("Keno", betAmount, 0, "loss");
      toast.error(`${matchCount} matches. Better luck next time!`);
    }
  };

  const reset = () => {
    setSelectedNumbers([]);
    setDrawnNumbers([]);
    setMatches([]);
  };

  const getNumberStyle = (num: number) => {
    const isSelected = selectedNumbers.includes(num);
    const isDrawn = drawnNumbers.includes(num);
    const isMatch = matches.includes(num);

    if (isMatch) return "bg-green-500 text-white ring-2 ring-green-300";
    if (isDrawn && isSelected) return "bg-red-500 text-white";
    if (isDrawn) return "bg-amber-500 text-white";
    if (isSelected) return "bg-primary text-primary-foreground";
    return "bg-muted hover:bg-muted/80";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">Keno</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-lg mx-auto p-4">
        <div className="bg-card p-4 rounded-xl border border-border space-y-4">
          {/* Info */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Selected: <span className="text-primary font-bold">{selectedNumbers.length}/{MAX_PICKS}</span>
            </span>
            {matches.length > 0 && (
              <span className="text-green-500 font-bold">
                Matches: {matches.length}
              </span>
            )}
          </div>

          {/* Number Grid */}
          <div className="grid grid-cols-8 gap-1">
            {NUMBERS.map(num => (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                disabled={drawing}
                className={`aspect-square rounded-md font-bold text-sm transition-all ${getNumberStyle(num)} ${drawing ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Drawn Numbers */}
          {drawnNumbers.length > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Drawn Numbers</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {drawnNumbers.map((num, i) => (
                  <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    matches.includes(num) ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                  }`}>
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={quickPick} disabled={drawing} className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              Quick Pick
            </Button>
            <Button variant="outline" onClick={reset} disabled={drawing} className="flex-1">
              Clear
            </Button>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={drawing}
              min={1}
            />
          </div>

          <Button onClick={draw} className="w-full" size="lg" disabled={drawing || selectedNumbers.length === 0}>
            {drawing ? "Drawing..." : "Draw Numbers"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Keno;
