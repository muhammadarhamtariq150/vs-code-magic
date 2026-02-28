import { useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import ChickenRoadHeader from "@/components/games/chicken-road/ChickenRoadHeader";
import ChickenRoadBoard from "@/components/games/chicken-road/ChickenRoadBoard";
import ChickenRoadControls from "@/components/games/chicken-road/ChickenRoadControls";

type Difficulty = "easy" | "medium" | "hard" | "hardcore";

const difficultyTraps: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  hardcore: 4,
};

const multipliers = [1.04, 1.08, 1.13, 1.18, 1.24, 1.30, 1.37, 1.44, 1.52, 1.61];

const ChickenRoad = () => {
  const { balance, updateBalance, recordTransaction } = useWallet();
  const { toast } = useToast();

  const [betAmount, setBetAmount] = useState("2");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLane, setCurrentLane] = useState(-1);
  const [lanes, setLanes] = useState<boolean[][]>([]);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [hitTrap, setHitTrap] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const generateLanes = useCallback(() => {
    const traps = difficultyTraps[difficulty];
    const cols = 5;
    const newLanes: boolean[][] = [];
    for (let i = 0; i < multipliers.length; i++) {
      const lane: boolean[] = Array(cols).fill(false);
      const trapPos = new Set<number>();
      while (trapPos.size < traps) trapPos.add(Math.floor(Math.random() * cols));
      trapPos.forEach((p) => (lane[p] = true));
      newLanes.push(lane);
    }
    return newLanes;
  }, [difficulty]);

  const startGame = () => {
    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      toast({ title: "Invalid bet", description: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (bet > balance) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }
    updateBalance(balance - bet);
    setLanes(generateLanes());
    setRevealedTiles([]);
    setCurrentLane(-1);
    setGameOver(false);
    setHitTrap(false);
    setIsPlaying(true);
  };

  const selectTile = (laneIndex: number, tileIndex: number) => {
    if (!isPlaying || gameOver || laneIndex !== currentLane + 1) return;
    const isTrap = lanes[laneIndex][tileIndex];
    const newRevealed = [...revealedTiles];
    newRevealed[laneIndex] = tileIndex;
    setRevealedTiles(newRevealed);
    setCurrentLane(laneIndex);

    if (isTrap) {
      setHitTrap(true);
      setGameOver(true);
      setIsPlaying(false);
      recordTransaction("Chicken Road", parseFloat(betAmount), 0, "loss");
      toast({ title: "💀 Shot down!", description: "The chicken didn't make it!", variant: "destructive" });
    } else if (laneIndex === multipliers.length - 1) {
      const win = parseFloat(betAmount) * multipliers[laneIndex];
      updateBalance(balance + win);
      recordTransaction("Chicken Road", parseFloat(betAmount), win, "win");
      setGameOver(true);
      setIsPlaying(false);
      toast({ title: "🎉 Maximum Win!", description: `You won $${win.toFixed(2)}!` });
    }
  };

  const cashOut = () => {
    if (!isPlaying || currentLane < 0) return;
    const win = parseFloat(betAmount) * multipliers[currentLane];
    updateBalance(balance + win);
    recordTransaction("Chicken Road", parseFloat(betAmount), win, "win");
    setGameOver(true);
    setIsPlaying(false);
    setHitTrap(false);
    toast({ title: "💰 Cashed Out!", description: `You won $${win.toFixed(2)}!` });
  };

  const currentMultiplier = currentLane < 0 ? 1 : multipliers[currentLane];

  return (
    <div className="min-h-screen bg-[#0f1923] flex flex-col">
      <ChickenRoadHeader balance={balance} onHowToPlay={() => setShowHowToPlay(!showHowToPlay)} />

      {/* How to play modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowHowToPlay(false)}>
          <div className="bg-[#1a2734] rounded-2xl p-6 max-w-md mx-4 border border-[#2a3a4c]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
              🐔 How to Play
            </h2>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>• Set your bet amount and difficulty level</li>
              <li>• Press <span className="text-emerald-400 font-bold">GO</span> to start</li>
              <li>• Click tiles to move the chicken across lanes</li>
              <li>• Each safe step increases your multiplier</li>
              <li>• Hit a trap and you lose your bet!</li>
              <li>• <span className="text-yellow-400 font-bold">Cash out</span> anytime to secure winnings</li>
            </ul>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="mt-4 w-full py-2 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Game board */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-3xl bg-[#172230] rounded-2xl border border-[#1e2d3d] p-4 min-h-[400px] flex flex-col">
            <ChickenRoadBoard
              isPlaying={isPlaying}
              gameOver={gameOver}
              currentLane={currentLane}
              lanes={lanes}
              revealedTiles={revealedTiles}
              multipliers={multipliers}
              onSelectTile={selectTile}
              hitTrap={hitTrap}
              difficulty={difficulty}
            />
          </div>
        </div>
      </div>

      <ChickenRoadControls
        betAmount={betAmount}
        setBetAmount={setBetAmount}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        isPlaying={isPlaying}
        gameOver={gameOver}
        currentLane={currentLane}
        currentMultiplier={currentMultiplier}
        betValue={parseFloat(betAmount) || 0}
        onStart={startGame}
        onCashOut={cashOut}
      />
    </div>
  );
};

export default ChickenRoad;
