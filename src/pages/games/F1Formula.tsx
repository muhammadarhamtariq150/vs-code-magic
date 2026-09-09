import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flag, Car, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const CARS = [
  { id: 1, name: "Red Bull", color: "bg-blue-600", odds: 2.5 },
  { id: 2, name: "Ferrari", color: "bg-red-600", odds: 3.0 },
  { id: 3, name: "Mercedes", color: "bg-teal-400", odds: 2.8 },
  { id: 4, name: "McLaren", color: "bg-orange-500", odds: 4.0 },
];

const F1Formula = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [positions, setPositions] = useState<number[]>([0, 0, 0, 0]);
  const [racing, setRacing] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);

  const startRace = async () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (selectedCar === null) {
      toast.error("Select a car to bet on");
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

    setRacing(true);
    setPositions([0, 0, 0, 0]);
    setWinner(null);

    // Race simulation
    const raceInterval = setInterval(() => {
      setPositions(prev => {
        const newPos = prev.map(p => p + Math.random() * 5);
        
        // Check for winner (100 = finish line)
        const winnerIndex = newPos.findIndex(p => p >= 100);
        if (winnerIndex !== -1) {
          clearInterval(raceInterval);
          finishRace(winnerIndex);
        }
        
        return newPos;
      });
    }, 100);
  };

  const finishRace = async (winnerIndex: number) => {
    setRacing(false);
    setWinner(winnerIndex);

    if (winnerIndex === selectedCar) {
      const winAmount = betAmount * CARS[winnerIndex].odds;
      await updateBalance(balance + winAmount);
      await recordTransaction("F1 Formula", betAmount, winAmount, "win");
      toast.success(`🏆 ${CARS[winnerIndex].name} wins! You won ₨${winAmount.toFixed(2)}!`);
    } else {
      await recordTransaction("F1 Formula", betAmount, 0, "loss");
      toast.error(`${CARS[winnerIndex].name} wins! Your car lost.`);
    }
  };

  const resetRace = () => {
    setPositions([0, 0, 0, 0]);
    setWinner(null);
    setSelectedCar(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-red-500 flex items-center gap-2">
          <Flag className="w-5 h-5" />
          F1 Formula
        </h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-2xl mx-auto p-4">
        <div className="bg-card p-6 rounded-xl border border-border space-y-6">
          {/* Race Track */}
          <div className="bg-gray-900 p-4 rounded-xl space-y-2">
            {CARS.map((car, index) => (
              <div key={car.id} className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-white w-20">{car.name}</span>
                  <span className="text-xs text-muted-foreground">{car.odds}x</span>
                </div>
                <div className="h-8 bg-gray-800 rounded relative overflow-hidden">
                  {/* Track lines */}
                  <div className="absolute inset-0 flex">
                    {Array(10).fill(null).map((_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-700 border-dashed" />
                    ))}
                  </div>
                  {/* Finish line */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50" />
                  {/* Car */}
                  <div 
                    className={`absolute top-1 h-6 w-8 ${car.color} rounded flex items-center justify-center transition-all duration-100`}
                    style={{ left: `${Math.min(positions[index], 95)}%` }}
                  >
                    <Car className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {winner !== null && (
            <div className={`p-4 rounded-lg text-center ${winner === selectedCar ? "bg-green-500/20" : "bg-red-500/20"}`}>
              <p className="text-lg font-bold">
                🏆 {CARS[winner].name} wins!
                {winner === selectedCar ? " You won!" : " Better luck next time!"}
              </p>
            </div>
          )}

          {/* Car Selection */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Select Your Car</label>
            <div className="grid grid-cols-2 gap-2">
              {CARS.map((car, index) => (
                <button
                  key={car.id}
                  onClick={() => !racing && setSelectedCar(index)}
                  disabled={racing}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedCar === index 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  } ${racing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 ${car.color} rounded flex items-center justify-center`}>
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{car.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">{car.odds}x</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={racing}
              min={1}
            />
          </div>

          {winner === null ? (
            <Button 
              onClick={startRace} 
              className="w-full bg-red-600 hover:bg-red-700" 
              size="lg" 
              disabled={racing || selectedCar === null}
            >
              {racing ? "🏎️ Racing..." : "🏁 Start Race"}
            </Button>
          ) : (
            <Button onClick={resetRace} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Race Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default F1Formula;
