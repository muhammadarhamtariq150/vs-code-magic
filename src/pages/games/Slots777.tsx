import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import SlotMachine from "@/components/games/slots/SlotMachine";
import { Symbol } from "@/components/games/slots/SlotSymbol";
import { toast } from "sonner";

const SYMBOLS: Symbol[] = [
  { icon: "🍒", name: "Cherry" },
  { icon: "🍋", name: "Lemon" },
  { icon: "🍊", name: "Orange" },
  { icon: "🍇", name: "Grape" },
  { icon: "🥝", name: "Kiwi" },
  { icon: "⭐", name: "Star" },
  { icon: "7️⃣", name: "Seven" },
];

const PAYOUTS: Record<string, number> = {
  "🍒": 2,
  "🍋": 3,
  "🍊": 4,
  "🍇": 5,
  "🥝": 6,
  "⭐": 15,
  "7️⃣": 77,
};

const BET_OPTIONS = [10, 25, 50, 100, 250, 500];
const REEL_COUNT = 5;
const ROW_COUNT = 3;

const getRandomSymbol = (): Symbol => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

const generateReelColumn = (): Symbol[] => 
  Array.from({ length: ROW_COUNT }, () => getRandomSymbol());

const generateAllReels = (): Symbol[][] => 
  Array.from({ length: REEL_COUNT }, () => generateReelColumn());

const Slots777 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [reels, setReels] = useState<Symbol[][]>(() => 
    Array.from({ length: REEL_COUNT }, () => [SYMBOLS[6], SYMBOLS[6], SYMBOLS[6]])
  );
  const [spinningReels, setSpinningReels] = useState<boolean[]>(Array(REEL_COUNT).fill(false));
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winningPositions, setWinningPositions] = useState<{ reel: number; row: number }[]>([]);
  const [autoSpin, setAutoSpin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [jackpotValues, setJackpotValues] = useState<number[]>([23888003, 423567008, 7353999087, 31215330000, 391666909406]);
  const [isSpinning, setIsSpinning] = useState(false);

  const checkWinLines = useCallback((finalReels: Symbol[][]): { winAmount: number; positions: { reel: number; row: number }[] } => {
    let totalWin = 0;
    const allPositions: { reel: number; row: number }[] = [];
    
    // Check middle row (main payline)
    const middleRow = finalReels.map(reel => reel[1]);
    const middleSymbol = middleRow[0].icon;
    let consecutiveCount = 1;
    
    for (let i = 1; i < REEL_COUNT; i++) {
      if (middleRow[i].icon === middleSymbol) {
        consecutiveCount++;
      } else break;
    }
    
    if (consecutiveCount >= 3) {
      const multiplier = PAYOUTS[middleSymbol] || 2;
      const lineWin = betAmount * multiplier * (consecutiveCount - 2);
      totalWin += lineWin;
      for (let i = 0; i < consecutiveCount; i++) {
        allPositions.push({ reel: i, row: 1 });
      }
    }
    
    // Check for any 5 of a kind across all visible symbols
    const allSymbols = finalReels.flatMap((reel, ri) => 
      reel.map((s, row) => ({ symbol: s.icon, reel: ri, row }))
    );
    
    const symbolCounts: Record<string, { reel: number; row: number }[]> = {};
    allSymbols.forEach(({ symbol, reel, row }) => {
      if (!symbolCounts[symbol]) symbolCounts[symbol] = [];
      symbolCounts[symbol].push({ reel, row });
    });
    
    // Bonus for getting 5+ of same symbol anywhere
    Object.entries(symbolCounts).forEach(([symbol, positions]) => {
      if (positions.length >= 5) {
        const bonus = betAmount * (PAYOUTS[symbol] || 2) * 0.5;
        totalWin += bonus;
        positions.forEach(p => {
          if (!allPositions.some(ap => ap.reel === p.reel && ap.row === p.row)) {
            allPositions.push(p);
          }
        });
      }
    });
    
    return { winAmount: Math.floor(totalWin), positions: allPositions };
  }, [betAmount]);

  const spin = useCallback(async () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    if (betAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (isSpinning) return;

    const success = await updateBalance(balance - betAmount);
    if (!success) {
      toast.error("Failed to place bet");
      return;
    }

    setIsSpinning(true);
    setLastWin(null);
    setWinningPositions([]);
    setSpinningReels(Array(REEL_COUNT).fill(true));

    // Generate final results
    const finalReels = generateAllReels();
    
    // Animate jackpot counters
    const jackpotInterval = setInterval(() => {
      setJackpotValues(prev => prev.map(v => v + Math.floor(Math.random() * 1000)));
    }, 100);

    // Staggered reel stops
    const stopDelays = [600, 900, 1200, 1500, 1800];
    
    // Spinning animation for each reel
    const spinIntervals: NodeJS.Timeout[] = [];
    
    for (let i = 0; i < REEL_COUNT; i++) {
      const interval = setInterval(() => {
        setReels(prev => {
          const newReels = [...prev];
          newReels[i] = generateReelColumn();
          return newReels;
        });
      }, 60);
      spinIntervals.push(interval);
      
      setTimeout(() => {
        clearInterval(spinIntervals[i]);
        setReels(prev => {
          const newReels = [...prev];
          newReels[i] = finalReels[i];
          return newReels;
        });
        setSpinningReels(prev => {
          const newSpinning = [...prev];
          newSpinning[i] = false;
          return newSpinning;
        });
      }, stopDelays[i]);
    }

    // Final result check
    setTimeout(async () => {
      clearInterval(jackpotInterval);
      setIsSpinning(false);
      
      const { winAmount, positions } = checkWinLines(finalReels);
      
      if (winAmount > 0) {
        await updateBalance(balance - betAmount + winAmount);
        await recordTransaction("Slots 777", betAmount, winAmount, "win");
        setLastWin(winAmount);
        setWinningPositions(positions);
        
        if (winAmount >= betAmount * 50) {
          toast.success(`🎰 MEGA JACKPOT! ₨${winAmount.toLocaleString()}! 🎰`, { duration: 5000 });
        } else if (winAmount >= betAmount * 10) {
          toast.success(`⭐ BIG WIN! ₨${winAmount.toLocaleString()}! ⭐`, { duration: 4000 });
        } else {
          toast.success(`Won ₨${winAmount.toLocaleString()}!`);
        }
      } else {
        await recordTransaction("Slots 777", betAmount, 0, "loss");
      }
    }, stopDelays[REEL_COUNT - 1] + 200);
  }, [user, betAmount, balance, updateBalance, recordTransaction, checkWinLines, isSpinning]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (autoSpin && !isSpinning && balance >= betAmount) {
      timeout = setTimeout(() => spin(), 1500);
    }
    return () => clearTimeout(timeout);
  }, [autoSpin, isSpinning, balance, betAmount, spin]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-red-950 overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              backgroundColor: i % 2 === 0 ? 'rgba(250, 204, 21, 0.4)' : 'rgba(239, 68, 68, 0.3)',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-2 sm:p-3 bg-gradient-to-b from-black/60 to-transparent">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 h-8 px-2"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          <span className="hidden sm:inline text-sm">Back</span>
        </Button>
        
        <div className="flex items-center gap-1">
          <span className="text-xl sm:text-2xl">🎰</span>
          <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
            SLOTS 777
          </h1>
          <span className="text-xl sm:text-2xl">🎰</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-yellow-400 hover:text-yellow-300 h-8 w-8"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <WalletDisplay />
        </div>
      </div>

      {/* Main Game Container */}
      <div className="relative z-10 container max-w-2xl mx-auto px-2 py-2 sm:py-4">
        {/* Slot Machine */}
        <SlotMachine
          reels={reels}
          spinningReels={spinningReels}
          winningPositions={winningPositions}
          jackpotValues={jackpotValues}
        />

        {/* Win Display */}
        {lastWin !== null && (
          <div className="mt-3 text-center p-3 rounded-xl bg-gradient-to-r from-yellow-500/30 via-orange-500/40 to-yellow-500/30 border border-yellow-400/50 animate-pulse">
            <p className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-400">
              🎉 YOU WON! 🎉
            </p>
            <p className="text-2xl sm:text-4xl font-black text-white">₨{lastWin.toLocaleString()}</p>
          </div>
        )}

        {/* Controls Section */}
        <div className="mt-3 sm:mt-4 bg-gradient-to-b from-red-900/80 to-red-950/80 rounded-xl p-3 sm:p-4 border border-amber-500/30">
          {/* Bet Selection */}
          <div className="mb-3">
            <p className="text-[10px] sm:text-xs text-amber-400/80 uppercase tracking-wider mb-1.5 text-center">Select Bet</p>
            <div className="grid grid-cols-6 gap-1">
              {BET_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isSpinning}
                  className={`py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    betAmount === amount
                      ? "bg-gradient-to-b from-yellow-400 to-amber-600 text-red-900 shadow-lg shadow-yellow-500/30 scale-105"
                      : "bg-red-800/60 text-amber-300 hover:bg-red-700/60 border border-amber-600/30"
                  }`}
                >
                  ₨{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Current Bet Display */}
          <div className="flex justify-between items-center mb-3 px-1">
            <div>
              <p className="text-[10px] sm:text-xs text-amber-400/60">Bet</p>
              <p className="text-base sm:text-lg font-bold text-yellow-400">₨{betAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-amber-400/60">Max Win</p>
              <p className="text-base sm:text-lg font-bold text-green-400">₨{(betAmount * 77).toLocaleString()}</p>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`relative w-full py-3 sm:py-4 rounded-xl font-black text-lg sm:text-xl uppercase tracking-wider transition-all overflow-hidden ${
              isSpinning
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-b from-yellow-400 via-amber-500 to-orange-600 text-red-900 hover:from-yellow-300 hover:via-amber-400 hover:to-orange-500 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-amber-500/40"
            }`}
          >
            {!isSpinning && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSpinning ? (
                <>⚡ SPINNING ⚡</>
              ) : (
                <>🎰 SPIN TO WIN 🎰</>
              )}
            </span>
          </button>

          {/* Auto Spin Toggle */}
          <div className="mt-2 flex items-center justify-center">
            <button
              onClick={() => setAutoSpin(!autoSpin)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                autoSpin
                  ? "bg-red-500/30 text-red-300 border border-red-500/50"
                  : "bg-amber-900/40 text-amber-400/80 border border-amber-600/30 hover:border-amber-500/50"
              }`}
            >
              {autoSpin ? "⏹ Stop Auto" : "🔄 Auto Spin"}
            </button>
          </div>
        </div>

        {/* Payouts */}
        <div className="mt-3 bg-black/40 rounded-lg p-2 sm:p-3 border border-amber-500/20">
          <p className="text-[10px] sm:text-xs text-amber-400/60 uppercase tracking-wider mb-1.5 text-center">Payouts (3+ in a row)</p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {SYMBOLS.map((s) => (
              <div key={s.icon} className="flex items-center gap-0.5 bg-red-900/50 px-1.5 py-0.5 rounded">
                <span className="text-sm sm:text-base">{s.icon}</span>
                <span className="text-[10px] sm:text-xs font-bold text-yellow-400">{PAYOUTS[s.icon]}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Slots777;
