import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";

type Difficulty = "easy" | "medium" | "hard" | "hardcore";

const difficultyConfig: Record<Difficulty, { traps: number; label: string; chance: string }> = {
  easy: { traps: 1, label: "Easy", chance: "Low" },
  medium: { traps: 2, label: "Medium", chance: "Medium" },
  hard: { traps: 3, label: "Hard", chance: "High" },
  hardcore: { traps: 4, label: "Hardcore", chance: "Very High" },
};

const multipliers = [1.04, 1.08, 1.13, 1.18, 1.24, 1.30, 1.37, 1.44, 1.52, 1.61];

const ChickenRoad = () => {
  const navigate = useNavigate();
  const { balance, updateBalance, recordTransaction } = useWallet();
  const { toast } = useToast();

  const [betAmount, setBetAmount] = useState<string>("10");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLane, setCurrentLane] = useState(-1);
  const [lanes, setLanes] = useState<boolean[][]>([]);
  const [revealedLanes, setRevealedLanes] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const generateLanes = () => {
    const config = difficultyConfig[difficulty];
    const totalColumns = 5;
    const newLanes: boolean[][] = [];

    for (let i = 0; i < multipliers.length; i++) {
      const lane: boolean[] = Array(totalColumns).fill(false);
      const trapPositions = new Set<number>();
      
      while (trapPositions.size < config.traps) {
        trapPositions.add(Math.floor(Math.random() * totalColumns));
      }
      
      trapPositions.forEach(pos => lane[pos] = true);
      newLanes.push(lane);
    }
    
    return newLanes;
  };

  const startGame = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      toast({ title: "Invalid bet", description: "Please enter a valid bet amount", variant: "destructive" });
      return;
    }
    if (bet > balance) {
      toast({ title: "Insufficient balance", description: "You don't have enough balance", variant: "destructive" });
      return;
    }

    updateBalance(balance - bet);
    setLanes(generateLanes());
    setRevealedLanes([]);
    setCurrentLane(-1);
    setGameOver(false);
    setWon(false);
    setIsPlaying(true);
  };

  const selectTile = (laneIndex: number, tileIndex: number) => {
    if (!isPlaying || gameOver || laneIndex !== currentLane + 1) return;

    const isTrap = lanes[laneIndex][tileIndex];
    setRevealedLanes([...revealedLanes, tileIndex]);
    setCurrentLane(laneIndex);

    if (isTrap) {
      setGameOver(true);
      setIsPlaying(false);
      recordTransaction("Chicken Road", parseFloat(betAmount), 0, "loss");
      toast({ title: "💥 Game Over!", description: "You hit a fire trap!", variant: "destructive" });
    } else if (laneIndex === multipliers.length - 1) {
      const winAmount = parseFloat(betAmount) * multipliers[laneIndex];
      updateBalance(balance + winAmount);
      recordTransaction("Chicken Road", parseFloat(betAmount), winAmount, "win");
      setGameOver(true);
      setWon(true);
      setIsPlaying(false);
      toast({ title: "🎉 Maximum Win!", description: `You won $${winAmount.toFixed(2)}!` });
    }
  };

  const cashOut = () => {
    if (!isPlaying || currentLane < 0) return;
    
    const winAmount = parseFloat(betAmount) * multipliers[currentLane];
    updateBalance(balance + winAmount);
    recordTransaction("Chicken Road", parseFloat(betAmount), winAmount, "win");
    setGameOver(true);
    setWon(true);
    setIsPlaying(false);
    toast({ title: "💰 Cashed Out!", description: `You won $${winAmount.toFixed(2)}!` });
  };

  const getCurrentMultiplier = () => {
    if (currentLane < 0) return 1;
    return multipliers[currentLane];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="text-white mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🐔 Chicken Road</h1>
          <p className="text-emerald-300">Cross the road safely and cash out before hitting a trap!</p>
        </div>

        {/* Game Board */}
        <div className="bg-black/30 rounded-2xl p-4 mb-6">
          <div className="flex flex-col-reverse gap-2">
            {multipliers.map((mult, laneIndex) => (
              <div key={laneIndex} className="flex items-center gap-2">
                <div className={`w-16 text-center font-bold text-sm py-2 rounded ${
                  currentLane >= laneIndex ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {mult.toFixed(2)}x
                </div>
                <div className="flex-1 grid grid-cols-5 gap-2">
                  {Array(5).fill(0).map((_, tileIndex) => {
                    const isRevealed = laneIndex < currentLane + 1 || (gameOver && laneIndex <= currentLane + 1);
                    const isCurrentPath = revealedLanes[laneIndex] === tileIndex;
                    const isTrap = lanes[laneIndex]?.[tileIndex];
                    const canClick = isPlaying && !gameOver && laneIndex === currentLane + 1;

                    return (
                      <button
                        key={tileIndex}
                        onClick={() => selectTile(laneIndex, tileIndex)}
                        disabled={!canClick}
                        className={`
                          aspect-square rounded-lg transition-all duration-200 flex items-center justify-center text-2xl
                          ${canClick ? 'hover:scale-105 hover:bg-emerald-600 cursor-pointer bg-emerald-700' : ''}
                          ${isRevealed && isTrap ? 'bg-red-600' : ''}
                          ${isRevealed && !isTrap && isCurrentPath ? 'bg-emerald-500' : ''}
                          ${isRevealed && !isTrap && !isCurrentPath ? 'bg-gray-600' : ''}
                          ${!isRevealed && !canClick ? 'bg-gray-800' : ''}
                        `}
                      >
                        {isRevealed && isTrap && <Flame className="w-6 h-6 text-orange-300" />}
                        {isRevealed && !isTrap && isCurrentPath && "🐔"}
                        {canClick && <ChevronRight className="w-5 h-5 text-white/50" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-black/30 rounded-2xl p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-white text-sm mb-2 block">Bet Amount</label>
              <div className="flex gap-2 mb-4">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={isPlaying}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                {[0.5, 1, 2, 5].map((val) => (
                  <Button
                    key={val}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(val.toString())}
                    disabled={isPlaying}
                    className="flex-1"
                  >
                    ${val}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Difficulty</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => (
                  <Button
                    key={diff}
                    variant={difficulty === diff ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficulty(diff)}
                    disabled={isPlaying}
                    className={difficulty === diff ? "bg-emerald-600" : ""}
                  >
                    {difficultyConfig[diff].label}
                  </Button>
                ))}
              </div>
              <p className="text-gray-400 text-sm">
                Chance of collision: <span className="text-white">{difficultyConfig[difficulty].chance}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-white">
              <span className="text-gray-400">Balance:</span> <span className="text-xl font-bold">${balance.toFixed(2)}</span>
            </div>
            
            {!isPlaying ? (
              <Button onClick={startGame} size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                Play
              </Button>
            ) : (
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Current Multiplier</p>
                  <p className="text-2xl font-bold text-emerald-400">{getCurrentMultiplier().toFixed(2)}x</p>
                </div>
                <Button 
                  onClick={cashOut} 
                  size="lg" 
                  disabled={currentLane < 0}
                  className="bg-yellow-600 hover:bg-yellow-700 flex-1"
                >
                  Cash Out ${(parseFloat(betAmount) * getCurrentMultiplier()).toFixed(2)}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* How to Play */}
        <div className="mt-6 bg-black/20 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-2">How to play:</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Set your bet amount and difficulty level</li>
            <li>• Click Play to start the game</li>
            <li>• Click on tiles to move the chicken forward</li>
            <li>• Each successful step increases your multiplier</li>
            <li>• Hit a fire trap and you lose your bet</li>
            <li>• Cash out anytime to secure your winnings!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChickenRoad;
