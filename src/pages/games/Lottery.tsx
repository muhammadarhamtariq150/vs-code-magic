import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const Lottery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const toggleNumber = (num: number) => {
    if (gameActive) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const startDraw = async () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (selectedNumbers.length !== 5) {
      toast.error("Please select 5 numbers");
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

    setGameActive(true);
    setIsDrawing(true);
    setDrawnNumbers([]);

    // Draw 5 random numbers
    const drawn: number[] = [];
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      let num;
      do {
        num = Math.floor(Math.random() * 36) + 1;
      } while (drawn.includes(num));
      drawn.push(num);
      setDrawnNumbers([...drawn]);
    }

    // Calculate matches
    const matches = selectedNumbers.filter(n => drawn.includes(n)).length;
    await finishGame(matches);
  };

  const finishGame = async (matches: number) => {
    setIsDrawing(false);
    
    const multipliers: Record<number, number> = { 0: 0, 1: 0, 2: 1, 3: 3, 4: 10, 5: 100 };
    const winAmount = betAmount * multipliers[matches];

    if (winAmount > 0) {
      await updateBalance(balance + winAmount);
      await recordTransaction("Lottery", betAmount, winAmount, "win");
      toast.success(`🎉 ${matches} matches! You won ₨${winAmount}!`);
    } else {
      await recordTransaction("Lottery", betAmount, 0, "loss");
      toast.error(`${matches} matches. Better luck next time!`);
    }
  };

  const resetGame = () => {
    setGameActive(false);
    setSelectedNumbers([]);
    setDrawnNumbers([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">Lottery</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-2xl mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={gameActive}
                min={1}
              />
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Select 5 numbers (1-36)</p>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={gameActive}
                  className={`
                    aspect-square rounded-lg font-bold text-sm transition-all
                    ${selectedNumbers.includes(num) 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80"}
                    ${drawnNumbers.includes(num) && selectedNumbers.includes(num)
                      ? "ring-2 ring-green-500 bg-green-500 text-white"
                      : drawnNumbers.includes(num)
                        ? "ring-2 ring-yellow-500"
                        : ""}
                    ${gameActive ? "cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {drawnNumbers.length > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Drawn Numbers:</p>
              <div className="flex justify-center gap-2">
                {drawnNumbers.map((num, i) => (
                  <div
                    key={i}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold
                      ${selectedNumbers.includes(num) ? "bg-green-500 text-white" : "bg-yellow-500 text-black"}
                    `}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>2 matches: 1x | 3 matches: 3x | 4 matches: 10x | 5 matches: 100x</p>
          </div>

          {!gameActive ? (
            <Button onClick={startDraw} className="w-full" disabled={selectedNumbers.length !== 5}>
              <Ticket className="w-4 h-4 mr-2" />
              Draw Numbers ({selectedNumbers.length}/5 selected)
            </Button>
          ) : isDrawing ? (
            <Button disabled className="w-full">Drawing...</Button>
          ) : (
            <Button onClick={resetGame} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lottery;
