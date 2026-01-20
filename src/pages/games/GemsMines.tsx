import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gem, Bomb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const GRID_SIZE = 25; // 5x5 grid
const DEFAULT_MINES = 5;

interface Cell {
  revealed: boolean;
  isMine: boolean;
  isGem: boolean;
}

const GemsMines = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [mineCount, setMineCount] = useState<number>(DEFAULT_MINES);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [gemsFound, setGemsFound] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initializeGrid = () => {
    const newGrid: Cell[] = Array(GRID_SIZE).fill(null).map(() => ({
      revealed: false,
      isMine: false,
      isGem: true,
    }));

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const randomIndex = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[randomIndex].isMine) {
        newGrid[randomIndex].isMine = true;
        newGrid[randomIndex].isGem = false;
        minesPlaced++;
      }
    }

    return newGrid;
  };

  const calculateMultiplier = (gems: number) => {
    // Multiplier increases with each gem found
    const safeSpots = GRID_SIZE - mineCount;
    const baseMultiplier = 0.97; // House edge
    let multiplier = 1;
    
    for (let i = 0; i < gems; i++) {
      multiplier *= (safeSpots - i) / (GRID_SIZE - i) * (1 / baseMultiplier);
    }
    
    return Math.max(1, multiplier);
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

    if (betAmount < 1) {
      toast.error("Minimum bet is ₨1");
      return;
    }

    // Deduct bet amount
    const newBalance = balance - betAmount;
    const success = await updateBalance(newBalance);
    
    if (!success) {
      toast.error("Failed to place bet");
      return;
    }

    setGrid(initializeGrid());
    setGameActive(true);
    setGemsFound(0);
    setCurrentMultiplier(1);
    setGameOver(false);
    setWon(false);
  };

  const revealCell = async (index: number) => {
    if (!gameActive || grid[index].revealed || gameOver) return;

    const newGrid = [...grid];
    newGrid[index].revealed = true;
    setGrid(newGrid);

    if (newGrid[index].isMine) {
      // Hit a mine - game over
      setGameOver(true);
      setGameActive(false);
      
      // Reveal all mines
      const revealedGrid = newGrid.map(cell => ({
        ...cell,
        revealed: cell.isMine ? true : cell.revealed,
      }));
      setGrid(revealedGrid);
      
      await recordTransaction("Gems Mines", betAmount, 0, "loss");
      toast.error("💥 You hit a mine!");
    } else {
      // Found a gem
      const newGemsFound = gemsFound + 1;
      setGemsFound(newGemsFound);
      
      const newMultiplier = calculateMultiplier(newGemsFound);
      setCurrentMultiplier(newMultiplier);
      
      // Check if all gems found
      const totalGems = GRID_SIZE - mineCount;
      if (newGemsFound === totalGems) {
        await cashOut();
      }
    }
  };

  const cashOut = async () => {
    if (!gameActive || gemsFound === 0) return;

    const winAmount = betAmount * currentMultiplier;
    const newBalance = balance + winAmount;
    
    await updateBalance(newBalance);
    await recordTransaction("Gems Mines", betAmount, winAmount, "win");
    
    setGameActive(false);
    setWon(true);
    setGameOver(true);
    
    toast.success(`🎉 You won ₨${winAmount.toFixed(2)}!`);
  };

  const resetGame = () => {
    setGrid([]);
    setGameActive(false);
    setGemsFound(0);
    setCurrentMultiplier(1);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-primary">Gems Mines</h1>
        <WalletDisplay />
      </div>

      <div className="container max-w-4xl mx-auto p-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4 bg-card p-6 rounded-xl border border-border">
            <div>
              <label className="text-sm text-muted-foreground">Bet Amount (₨)</label>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={gameActive}
                min={1}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Number of Mines</label>
              <Input
                type="number"
                value={mineCount}
                onChange={(e) => setMineCount(Math.min(24, Math.max(1, Number(e.target.value))))}
                disabled={gameActive}
                min={1}
                max={24}
                className="mt-1"
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gems Found:</span>
                <span className="font-semibold text-primary">{gemsFound}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Multiplier:</span>
                <span className="font-semibold text-green-500">{currentMultiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potential Win:</span>
                <span className="font-semibold text-primary">₨{(betAmount * currentMultiplier).toFixed(2)}</span>
              </div>
            </div>

            {!gameActive ? (
              <Button onClick={startGame} className="w-full" size="lg">
                Start Game
              </Button>
            ) : (
              <div className="space-y-2">
                <Button 
                  onClick={cashOut} 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="lg"
                  disabled={gemsFound === 0}
                >
                  Cash Out ₨{(betAmount * currentMultiplier).toFixed(2)}
                </Button>
              </div>
            )}

            {gameOver && (
              <Button onClick={resetGame} variant="outline" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            )}
          </div>

          {/* Game Grid */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <div className="grid grid-cols-5 gap-2">
              {(grid.length > 0 ? grid : Array(GRID_SIZE).fill(null)).map((cell, index) => (
                <button
                  key={index}
                  onClick={() => revealCell(index)}
                  disabled={!gameActive || cell?.revealed}
                  className={`
                    aspect-square rounded-lg border-2 transition-all duration-200
                    flex items-center justify-center text-2xl
                    ${!cell?.revealed 
                      ? 'bg-muted/50 border-border hover:bg-muted hover:border-primary cursor-pointer' 
                      : cell?.isMine 
                        ? 'bg-red-500/20 border-red-500' 
                        : 'bg-green-500/20 border-green-500'
                    }
                    ${!gameActive && !cell?.revealed ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {cell?.revealed && (
                    cell.isMine ? (
                      <Bomb className="w-6 h-6 text-red-500" />
                    ) : (
                      <Gem className="w-6 h-6 text-green-500" />
                    )
                  )}
                </button>
              ))}
            </div>

            {gameOver && (
              <div className={`mt-4 p-4 rounded-lg text-center ${won ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <p className={`text-lg font-bold ${won ? 'text-green-500' : 'text-red-500'}`}>
                  {won ? `🎉 You Won ₨${(betAmount * currentMultiplier).toFixed(2)}!` : '💥 Game Over!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemsMines;
