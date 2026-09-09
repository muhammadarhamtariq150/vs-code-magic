import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const CARDS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["♠", "♥", "♦", "♣"];

type BetType = "dragon" | "tiger" | "tie";

const DragonTiger = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);
  const [dealing, setDealing] = useState(false);
  const [dragonCard, setDragonCard] = useState<{ value: string; suit: string } | null>(null);
  const [tigerCard, setTigerCard] = useState<{ value: string; suit: string } | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const getCardValue = (card: string) => CARDS.indexOf(card) + 1;

  const getRandomCard = () => ({
    value: CARDS[Math.floor(Math.random() * CARDS.length)],
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
  });

  const deal = async () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (!selectedBet) {
      toast.error("Select Dragon, Tiger, or Tie");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }

    const success = await updateBalance(balance - betAmount);
    if (!success) return;

    setDealing(true);
    setDragonCard(null);
    setTigerCard(null);
    setWinner(null);

    // Deal Dragon card
    setTimeout(() => {
      const dragon = getRandomCard();
      setDragonCard(dragon);

      // Deal Tiger card
      setTimeout(async () => {
        const tiger = getRandomCard();
        setTigerCard(tiger);

        const dragonValue = getCardValue(dragon.value);
        const tigerValue = getCardValue(tiger.value);

        let result: string;
        if (dragonValue > tigerValue) {
          result = "dragon";
        } else if (tigerValue > dragonValue) {
          result = "tiger";
        } else {
          result = "tie";
        }

        setWinner(result);
        setDealing(false);

        let won = false;
        let multiplier = 0;

        if (selectedBet === result) {
          won = true;
          multiplier = result === "tie" ? 8 : 2;
        }

        if (won) {
          const winAmount = betAmount * multiplier;
          await updateBalance(balance - betAmount + winAmount);
          await recordTransaction("Dragon Tiger", betAmount, winAmount, "win");
          toast.success(`🐉 You won ₨${winAmount}!`);
        } else {
          await recordTransaction("Dragon Tiger", betAmount, 0, "loss");
          toast.error("Better luck next time!");
        }
      }, 800);
    }, 500);
  };

  const CardDisplay = ({ card, label, isWinner }: { card: { value: string; suit: string } | null; label: string; isWinner: boolean }) => (
    <div className={`text-center p-4 rounded-xl transition-all ${isWinner ? "bg-primary/20 ring-2 ring-primary" : "bg-muted/50"}`}>
      <p className="text-lg font-bold mb-2">{label}</p>
      {card ? (
        <div className={`inline-flex flex-col items-center justify-center w-20 h-28 bg-white rounded-lg shadow-lg ${
          card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-gray-900"
        }`}>
          <span className="text-2xl font-bold">{card.value}</span>
          <span className="text-3xl">{card.suit}</span>
        </div>
      ) : (
        <div className="inline-flex items-center justify-center w-20 h-28 bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg shadow-lg">
          <span className="text-2xl">🂠</span>
        </div>
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
        <h1 className="text-xl font-bold text-primary">Dragon Tiger</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-md mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-2 gap-4">
            <CardDisplay card={dragonCard} label="🐉 Dragon" isWinner={winner === "dragon"} />
            <CardDisplay card={tigerCard} label="🐯 Tiger" isWinner={winner === "tiger"} />
          </div>

          {winner === "tie" && (
            <div className="text-center text-2xl font-bold text-amber-500">🎯 TIE!</div>
          )}

          {/* Bet Options */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedBet("dragon")}
              disabled={dealing}
              className={`py-4 rounded-xl font-bold text-white bg-gradient-to-br from-orange-500 to-red-600 transition-all ${
                selectedBet === "dragon" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              } ${dealing ? "opacity-50" : "hover:opacity-80"}`}
            >
              <div>🐉 Dragon</div>
              <div className="text-xs opacity-80">2x</div>
            </button>
            <button
              onClick={() => setSelectedBet("tie")}
              disabled={dealing}
              className={`py-4 rounded-xl font-bold text-white bg-gradient-to-br from-amber-500 to-yellow-600 transition-all ${
                selectedBet === "tie" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              } ${dealing ? "opacity-50" : "hover:opacity-80"}`}
            >
              <div>🎯 Tie</div>
              <div className="text-xs opacity-80">8x</div>
            </button>
            <button
              onClick={() => setSelectedBet("tiger")}
              disabled={dealing}
              className={`py-4 rounded-xl font-bold text-white bg-gradient-to-br from-amber-600 to-orange-700 transition-all ${
                selectedBet === "tiger" ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
              } ${dealing ? "opacity-50" : "hover:opacity-80"}`}
            >
              <div>🐯 Tiger</div>
              <div className="text-xs opacity-80">2x</div>
            </button>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={dealing}
              min={1}
            />
          </div>

          <Button onClick={deal} className="w-full" size="lg" disabled={dealing || !selectedBet}>
            {dealing ? "Dealing..." : "Deal Cards"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DragonTiger;
