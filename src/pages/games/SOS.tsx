import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const GRID_SIZE = 9;

const SOS = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [grid, setGrid] = useState<string[]>(Array(GRID_SIZE).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState<"S" | "O">("S");
  const [gameActive, setGameActive] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const checkSOS = (newGrid: string[], index: number): number => {
    let count = 0;
    const row = Math.floor(index / 3);
    const col = index % 3;

    // Check horizontal
    if (col >= 2 && newGrid[index] === "S" && newGrid[index-1] === "O" && newGrid[index-2] === "S") count++;
    if (col <= 0 && newGrid[index] === "S" && newGrid[index+1] === "O" && newGrid[index+2] === "S") count++;
    if (col === 1 && newGrid[index] === "O" && newGrid[index-1] === "S" && newGrid[index+1] === "S") count++;

    // Check vertical
    if (row >= 2 && newGrid[index] === "S" && newGrid[index-3] === "O" && newGrid[index-6] === "S") count++;
    if (row <= 0 && newGrid[index] === "S" && newGrid[index+3] === "O" && newGrid[index+6] === "S") count++;
    if (row === 1 && newGrid[index] === "O" && newGrid[index-3] === "S" && newGrid[index+3] === "S") count++;

    // Check diagonals
    if (row >= 2 && col >= 2 && newGrid[index] === "S" && newGrid[index-4] === "O" && newGrid[index-8] === "S") count++;
    if (row <= 0 && col <= 0 && newGrid[index] === "S" && newGrid[index+4] === "O" && newGrid[index+8] === "S") count++;
    if (row >= 2 && col <= 0 && newGrid[index] === "S" && newGrid[index-2] === "O" && newGrid[index-4] === "S") count++;
    if (row <= 0 && col >= 2 && newGrid[index] === "S" && newGrid[index+2] === "O" && newGrid[index+4] === "S") count++;

    return count;
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

    setGrid(Array(GRID_SIZE).fill(""));
    setPlayerScore(0);
    setCpuScore(0);
    setGameActive(true);
    setGameOver(false);
    setCurrentPlayer("S");
  };

  const makeMove = async (index: number) => {
    if (!gameActive || grid[index] !== "" || gameOver) return;

    const newGrid = [...grid];
    newGrid[index] = currentPlayer;
    setGrid(newGrid);

    const sosCount = checkSOS(newGrid, index);
    const newPlayerScore = playerScore + sosCount;
    setPlayerScore(newPlayerScore);

    // Check if game is over
    const emptySpots = newGrid.filter(cell => cell === "").length;
    if (emptySpots === 0) {
      await endGame(newPlayerScore, cpuScore);
      return;
    }

    // CPU move
    setTimeout(() => cpuMove(newGrid, newPlayerScore), 500);
    setCurrentPlayer(currentPlayer === "S" ? "O" : "S");
  };

  const cpuMove = async (currentGrid: string[], pScore: number) => {
    const emptyIndices = currentGrid.map((cell, i) => cell === "" ? i : -1).filter(i => i !== -1);
    if (emptyIndices.length === 0) return;

    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const cpuChoice = Math.random() > 0.5 ? "S" : "O";
    
    const newGrid = [...currentGrid];
    newGrid[randomIndex] = cpuChoice;
    setGrid(newGrid);

    const sosCount = checkSOS(newGrid, randomIndex);
    const newCpuScore = cpuScore + sosCount;
    setCpuScore(newCpuScore);

    const emptySpots = newGrid.filter(cell => cell === "").length;
    if (emptySpots === 0) {
      await endGame(pScore, newCpuScore);
    }
  };

  const endGame = async (pScore: number, cScore: number) => {
    setGameActive(false);
    setGameOver(true);

    if (pScore > cScore) {
      const winAmount = betAmount * 2;
      await updateBalance(balance + winAmount);
      await recordTransaction("SOS", betAmount, winAmount, "win");
      toast.success(`🎉 You won ₨${winAmount}!`);
    } else if (pScore < cScore) {
      await recordTransaction("SOS", betAmount, 0, "loss");
      toast.error("CPU wins!");
    } else {
      await updateBalance(balance + betAmount);
      await recordTransaction("SOS", betAmount, betAmount, "draw");
      toast.info("It's a draw! Bet returned.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">SOS</h1>
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
            <div className="flex items-end">
              {!gameActive ? (
                <Button onClick={startGame}>Start Game</Button>
              ) : (
                <Button variant="outline" disabled>Playing...</Button>
              )}
            </div>
          </div>

          <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Your Score</p>
              <p className="text-2xl font-bold text-primary">{playerScore}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">CPU Score</p>
              <p className="text-2xl font-bold text-red-500">{cpuScore}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {grid.map((cell, index) => (
              <button
                key={index}
                onClick={() => makeMove(index)}
                disabled={!gameActive || cell !== ""}
                className={`
                  aspect-square text-3xl font-bold rounded-lg border-2 transition-all
                  ${cell === "" ? "bg-muted/50 border-border hover:border-primary" : "bg-card border-primary"}
                  ${!gameActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {cell}
              </button>
            ))}
          </div>

          <p className="text-center text-muted-foreground">
            Click to place: <span className="font-bold text-primary">{currentPlayer}</span>
          </p>

          {gameOver && (
            <Button onClick={startGame} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOS;
