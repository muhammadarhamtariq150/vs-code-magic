import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const CARDS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["♠", "♥", "♦", "♣"];

const HighOrLow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [currentCard, setCurrentCard] = useState<{ value: string; suit: string } | null>(null);
  const [nextCard, setNextCard] = useState<{ value: string; suit: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const getRandomCard = () => ({
    value: CARDS[Math.floor(Math.random() * CARDS.length)],
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
  });

  const getCardValue = (card: string) => CARDS.indexOf(card);

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

    setCurrentCard(getRandomCard());
    setNextCard(null);
    setStreak(0);
    setGameActive(true);
    setGameOver(false);
  };

  const guess = async (guessHigh: boolean) => {
    if (!gameActive || revealing) return;
    
    setRevealing(true);
    const next = getRandomCard();
    setNextCard(next);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentValue = getCardValue(currentCard!.value);
    const nextValue = getCardValue(next.value);
    
    const isHigher = nextValue > currentValue;
    const isCorrect = guessHigh ? isHigher : !isHigher;

    if (nextValue === currentValue) {
      // Tie - push
      toast.info("It's a tie! Continuing...");
      setCurrentCard(next);
      setRevealing(false);
      return;
    }

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCurrentCard(next);
      setRevealing(false);
      toast.success(`Correct! Streak: ${newStreak}`);
    } else {
      setGameActive(false);
      setGameOver(true);
      await recordTransaction("High or Low", betAmount, 0, "loss");
      toast.error("Wrong guess! Game Over");
    }
  };

  const cashOut = async () => {
    const multiplier = 1 + streak * 0.5;
    const winAmount = betAmount * multiplier;
    
    await updateBalance(balance + winAmount);
    await recordTransaction("High or Low", betAmount, winAmount, "win");
    
    setGameActive(false);
    setGameOver(true);
    toast.success(`🎉 Cashed out ₨${winAmount.toFixed(2)}!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">High or Low</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={gameActive}
              min={1}
            />
          </div>

          <div className="flex justify-center gap-4">
            {currentCard && (
              <div className={`w-24 h-36 rounded-lg border-2 border-primary flex flex-col items-center justify-center text-2xl font-bold bg-card ${currentCard.suit === "♥" || currentCard.suit === "♦" ? "text-red-500" : "text-foreground"}`}>
                <span>{currentCard.value}</span>
                <span className="text-3xl">{currentCard.suit}</span>
              </div>
            )}
            {nextCard && (
              <div className={`w-24 h-36 rounded-lg border-2 border-yellow-500 flex flex-col items-center justify-center text-2xl font-bold bg-card ${nextCard.suit === "♥" || nextCard.suit === "♦" ? "text-red-500" : "text-foreground"}`}>
                <span>{nextCard.value}</span>
                <span className="text-3xl">{nextCard.suit}</span>
              </div>
            )}
          </div>

          {gameActive && (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-muted-foreground">Streak: <span className="font-bold text-primary">{streak}</span></p>
              <p className="text-muted-foreground">Multiplier: <span className="font-bold text-green-500">{(1 + streak * 0.5).toFixed(1)}x</span></p>
              <p className="text-muted-foreground">Potential Win: <span className="font-bold">₨{(betAmount * (1 + streak * 0.5)).toFixed(2)}</span></p>
            </div>
          )}

          {!gameActive ? (
            <Button onClick={startGame} className="w-full" size="lg">
              Start Game
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => guess(true)} disabled={revealing} size="lg" className="bg-green-600 hover:bg-green-700">
                  <ArrowUp className="w-5 h-5 mr-2" />
                  Higher
                </Button>
                <Button onClick={() => guess(false)} disabled={revealing} size="lg" className="bg-red-600 hover:bg-red-700">
                  <ArrowDown className="w-5 h-5 mr-2" />
                  Lower
                </Button>
              </div>
              {streak > 0 && (
                <Button onClick={cashOut} variant="outline" className="w-full" disabled={revealing}>
                  Cash Out ₨{(betAmount * (1 + streak * 0.5)).toFixed(2)}
                </Button>
              )}
            </div>
          )}

          {gameOver && (
            <Button onClick={startGame} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HighOrLow;
