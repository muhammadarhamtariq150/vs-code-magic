import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Hand, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const CARDS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["♠", "♥", "♦", "♣"];

interface Card { value: string; suit: string; }

const Blackjack21 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [dealerRevealed, setDealerRevealed] = useState(false);

  const getRandomCard = (): Card => ({
    value: CARDS[Math.floor(Math.random() * CARDS.length)],
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
  });

  const getHandValue = (hand: Card[]): number => {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.value === "A") {
        aces++;
        value += 11;
      } else if (["K", "Q", "J"].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

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

    const pHand = [getRandomCard(), getRandomCard()];
    const dHand = [getRandomCard(), getRandomCard()];
    
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameActive(true);
    setGameOver(false);
    setDealerRevealed(false);

    // Check for blackjack
    if (getHandValue(pHand) === 21) {
      setTimeout(() => stand(pHand, dHand), 500);
    }
  };

  const hit = () => {
    const newCard = getRandomCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    if (getHandValue(newHand) > 21) {
      endGame(newHand, dealerHand, false);
    }
  };

  const stand = async (pHand = playerHand, dHand = dealerHand) => {
    setDealerRevealed(true);
    let currentDealerHand = [...dHand];

    // Dealer draws until 17
    while (getHandValue(currentDealerHand) < 17) {
      await new Promise(resolve => setTimeout(resolve, 500));
      currentDealerHand = [...currentDealerHand, getRandomCard()];
      setDealerHand(currentDealerHand);
    }

    const playerValue = getHandValue(pHand);
    const dealerValue = getHandValue(currentDealerHand);

    if (dealerValue > 21 || playerValue > dealerValue) {
      endGame(pHand, currentDealerHand, true);
    } else if (playerValue < dealerValue) {
      endGame(pHand, currentDealerHand, false);
    } else {
      // Push - return bet
      await updateBalance(balance + betAmount);
      await recordTransaction("21 Blackjack", betAmount, betAmount, "draw");
      setGameActive(false);
      setGameOver(true);
      toast.info("Push! Bet returned.");
    }
  };

  const endGame = async (pHand: Card[], dHand: Card[], playerWins: boolean) => {
    setGameActive(false);
    setGameOver(true);
    setDealerRevealed(true);

    if (playerWins) {
      const isBlackjack = pHand.length === 2 && getHandValue(pHand) === 21;
      const winAmount = betAmount * (isBlackjack ? 2.5 : 2);
      await updateBalance(balance + winAmount);
      await recordTransaction("21 Blackjack", betAmount, winAmount, "win");
      toast.success(`🎉 ${isBlackjack ? "Blackjack! " : ""}You won ₨${winAmount}!`);
    } else {
      await recordTransaction("21 Blackjack", betAmount, 0, "loss");
      toast.error("Dealer wins!");
    }
  };

  const CardDisplay = ({ card, hidden }: { card: Card; hidden?: boolean }) => (
    <div className={`w-16 h-24 rounded-lg border-2 border-border flex flex-col items-center justify-center text-lg font-bold bg-card ${!hidden && (card.suit === "♥" || card.suit === "♦") ? "text-red-500" : "text-foreground"}`}>
      {hidden ? (
        <span className="text-2xl">?</span>
      ) : (
        <>
          <span>{card.value}</span>
          <span className="text-xl">{card.suit}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">21 Blackjack</h1>
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

          {dealerHand.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Dealer {dealerRevealed && `(${getHandValue(dealerHand)})`}
              </p>
              <div className="flex gap-2 flex-wrap">
                {dealerHand.map((card, i) => (
                  <CardDisplay key={i} card={card} hidden={!dealerRevealed && i === 1} />
                ))}
              </div>
            </div>
          )}

          {playerHand.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your Hand ({getHandValue(playerHand)})
              </p>
              <div className="flex gap-2 flex-wrap">
                {playerHand.map((card, i) => (
                  <CardDisplay key={i} card={card} />
                ))}
              </div>
            </div>
          )}

          {!gameActive ? (
            <Button onClick={startGame} className="w-full" size="lg">
              Deal Cards
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={hit} disabled={getHandValue(playerHand) >= 21}>
                <Plus className="w-4 h-4 mr-2" />
                Hit
              </Button>
              <Button onClick={() => stand()} variant="secondary">
                <Hand className="w-4 h-4 mr-2" />
                Stand
              </Button>
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

export default Blackjack21;
