import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import SlotMachine from "@/components/games/slots/SlotMachine";
import { Symbol } from "@/components/games/slots/SlotSymbol";
import { toast } from "sonner";

// Classic 3-reel symbols matching the reference
const SYMBOLS: Symbol[] = [
  { icon: "7", name: "Seven" },
  { icon: "BAR", name: "Bar", isBar: true },
  { icon: "🍒", name: "Cherry" },
  { icon: "🔔", name: "Bell" },
  { icon: "⭐", name: "Star" },
  { icon: "RESPIN", name: "Respin" },
];

const PAYOUTS: Record<string, number> = {
  Seven: 200,
  Bar: 20,
  Cherry: 8,
  Bell: 10,
  Star: 15,
  Respin: 4,
};

const BET_OPTIONS = [0.6, 1, 2, 5, 10, 20];
const REEL_COUNT = 3;
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

  const [betAmount, setBetAmount] = useState<number>(0.6);
  const [reels, setReels] = useState<Symbol[][]>(() =>
    Array.from({ length: REEL_COUNT }, () => [SYMBOLS[0], SYMBOLS[1], SYMBOLS[0]])
  );
  const [spinningReels, setSpinningReels] = useState<boolean[]>(Array(REEL_COUNT).fill(false));
  const [lastWin, setLastWin] = useState<number>(0);
  const [winningPositions, setWinningPositions] = useState<{ reel: number; row: number }[]>([]);
  const [turboMode, setTurboMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);

  // Audio context for sound effects
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSpinningSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(120, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.15);
      oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (e) { /* silent */ }
  }, [soundEnabled, getAudioContext]);

  const playReelStopSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(180, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.12);
    } catch (e) { /* silent */ }
  }, [soundEnabled, getAudioContext]);

  const playTickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 80 + Math.random() * 40;
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) { /* silent */ }
  }, [soundEnabled, getAudioContext]);

  const playWinSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(ctx.currentTime + i * 0.1);
        oscillator.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch (e) { /* silent */ }
  }, [soundEnabled, getAudioContext]);

  const playJackpotSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const notes = [523, 659, 784, 880, 1047, 1319, 1568];
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.5);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(ctx.currentTime + i * 0.08);
        oscillator.stop(ctx.currentTime + i * 0.08 + 0.5);
      });
    } catch (e) { /* silent */ }
  }, [soundEnabled, getAudioContext]);

  const checkWinLines = useCallback((finalReels: Symbol[][]): { winAmount: number; positions: { reel: number; row: number }[] } => {
    let totalWin = 0;
    const allPositions: { reel: number; row: number }[] = [];

    // Check middle row (main payline)
    const middleRow = finalReels.map((reel) => reel[1]);
    const middleSymbol = middleRow[0].name;

    if (middleRow.every((s) => s.name === middleSymbol)) {
      const multiplier = PAYOUTS[middleSymbol] || 2;
      totalWin = betAmount * multiplier;
      for (let i = 0; i < REEL_COUNT; i++) {
        allPositions.push({ reel: i, row: 1 });
      }
    }

    return { winAmount: Math.floor(totalWin * 100) / 100, positions: allPositions };
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
    setLastWin(0);
    setWinningPositions([]);
    setSpinningReels(Array(REEL_COUNT).fill(true));

    // Play spin start sound
    playSpinningSound();

    // Generate final results
    const finalReels = generateAllReels();

    // Spin timing based on turbo mode
    const baseDelay = turboMode ? 250 : 500;
    const stopDelays = [baseDelay, baseDelay * 2, baseDelay * 3];

    // Spinning animation for each reel
    const spinIntervals: NodeJS.Timeout[] = [];

    for (let i = 0; i < REEL_COUNT; i++) {
      const interval = setInterval(() => {
        setReels((prev) => {
          const newReels = [...prev];
          newReels[i] = generateReelColumn();
          return newReels;
        });
        // Play tick sound occasionally during spin
        if (Math.random() > 0.6) {
          playTickSound();
        }
      }, 60);
      spinIntervals.push(interval);

      setTimeout(() => {
        clearInterval(spinIntervals[i]);
        setReels((prev) => {
          const newReels = [...prev];
          newReels[i] = finalReels[i];
          return newReels;
        });
        setSpinningReels((prev) => {
          const newSpinning = [...prev];
          newSpinning[i] = false;
          return newSpinning;
        });
        playReelStopSound();
      }, stopDelays[i]);
    }

    // Final result check
    setTimeout(async () => {
      setIsSpinning(false);

      const { winAmount, positions } = checkWinLines(finalReels);

      if (winAmount > 0) {
        await updateBalance(balance - betAmount + winAmount);
        await recordTransaction("Slots 777", betAmount, winAmount, "win");
        setLastWin(winAmount);
        setWinningPositions(positions);

        if (winAmount >= betAmount * 100) {
          playJackpotSound();
          toast.success(`🎰 JACKPOT! ₨${winAmount.toLocaleString()}! 🎰`, { duration: 5000 });
        } else if (winAmount >= betAmount * 10) {
          playWinSound();
          toast.success(`⭐ BIG WIN! ₨${winAmount.toLocaleString()}! ⭐`, { duration: 4000 });
        } else {
          playWinSound();
          toast.success(`Won ₨${winAmount}!`);
        }
      } else {
        await recordTransaction("Slots 777", betAmount, 0, "loss");
      }
    }, stopDelays[REEL_COUNT - 1] + 150);
  }, [user, betAmount, balance, updateBalance, recordTransaction, checkWinLines, isSpinning, turboMode, playSpinningSound, playReelStopSound, playTickSound, playWinSound, playJackpotSound]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-800 via-orange-900 to-red-950 overflow-hidden">
      {/* Animated background sparkles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              backgroundColor: i % 3 === 0 ? "rgba(250, 204, 21, 0.6)" : i % 3 === 1 ? "rgba(251, 146, 60, 0.5)" : "rgba(255, 255, 255, 0.3)",
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
        </Button>

        {/* Title - Crazy 777 style */}
        <div className="flex items-center">
          <span
            className="text-2xl sm:text-3xl md:text-4xl font-black"
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              background: 'linear-gradient(to bottom, #ff6600 0%, #ff3333 50%, #cc0000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(255,100,0,0.5)',
              filter: 'drop-shadow(2px 2px 0 #000)',
            }}
          >
            Crazy
          </span>
          <span
            className="text-3xl sm:text-4xl md:text-5xl font-black ml-1"
            style={{
              fontFamily: 'Arial Black, Impact, sans-serif',
              background: 'linear-gradient(to bottom, #ffcc00 0%, #ff9900 50%, #ff6600 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(255,150,0,0.8)',
              filter: 'drop-shadow(2px 2px 0 #000)',
            }}
          >
            777
          </span>
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
      <div className="relative z-10 container max-w-md mx-auto px-2 py-2 sm:py-4">
        {/* Paytable */}
        <div className="bg-gradient-to-b from-red-800/90 to-red-950/90 rounded-lg p-2 mb-3 border border-yellow-600/40">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between bg-black/40 rounded px-2 py-1.5">
              <span className="text-red-400 font-black text-base" style={{ textShadow: '0 0 5px rgba(255,0,0,0.5)' }}>777</span>
              <span className="text-yellow-400 font-bold">200</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 rounded px-2 py-1.5">
              <span className="text-blue-400 font-black text-[10px]">BAR BAR BAR</span>
              <span className="text-yellow-400 font-bold">20</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 rounded px-2 py-1.5">
              <span>🍒🍒🍒</span>
              <span className="text-yellow-400 font-bold">8</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 rounded px-2 py-1.5">
              <span>🔔🔔🔔</span>
              <span className="text-yellow-400 font-bold">10</span>
            </div>
          </div>
        </div>

        {/* Slot Machine */}
        <SlotMachine
          reels={reels}
          spinningReels={spinningReels}
          winningPositions={winningPositions}
        />

        {/* Control Panel */}
        <div className="mt-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-3 border-2 border-gray-600 shadow-xl">
          {/* Balance, Bet, Win display row */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gray-700 rounded-full p-1.5">
                <Settings className="w-3 h-3 text-gray-400" />
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wide">Balance</p>
                <p className="text-sm font-bold text-white">₨ {balance.toFixed(2)}</p>
              </div>
            </div>

            <div className="text-center px-3 py-1 bg-gray-700/50 rounded-lg">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide">Bet</p>
              <p className="text-sm font-bold text-yellow-400">₨ {betAmount}</p>
            </div>

            <div className="text-center">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide">Win</p>
              <p className={`text-sm font-bold ${lastWin > 0 ? "text-green-400 animate-pulse" : "text-white"}`}>
                ₨ {lastWin.toFixed(2)}
              </p>
            </div>

            {/* Turbo button */}
            <button
              onClick={() => setTurboMode(!turboMode)}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-0.5 ${
                turboMode
                  ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/30"
                  : "bg-gray-700 text-yellow-400 border border-yellow-500/50"
              }`}
            >
              <Zap className="w-3 h-3" />
              TURBO
            </button>
          </div>

          {/* Bet Selection chips */}
          <div className="grid grid-cols-6 gap-1 mb-4">
            {BET_OPTIONS.map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={isSpinning}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  betAmount === amount
                    ? "bg-gradient-to-b from-yellow-400 to-amber-600 text-black shadow-lg shadow-yellow-500/40 scale-105"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                }`}
              >
                ₨{amount}
              </button>
            ))}
          </div>

          {/* Big Green Spin Button */}
          <button
            onClick={spin}
            disabled={isSpinning}
            className={`relative w-full py-4 rounded-full font-black text-xl uppercase tracking-wider transition-all overflow-hidden ${
              isSpinning
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-b from-green-400 via-green-500 to-green-700 text-white hover:from-green-300 hover:via-green-400 hover:to-green-600 hover:scale-[1.02] active:scale-[0.98]"
            }`}
            style={{
              boxShadow: isSpinning ? "none" : "0 0 30px rgba(34, 197, 94, 0.5), inset 0 2px 0 rgba(255,255,255,0.3), 0 4px 15px rgba(0,0,0,0.4)",
            }}
          >
            {!isSpinning && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            )}
            <span className="relative z-10">
              {isSpinning ? "SPINNING..." : "SPIN"}
            </span>
          </button>
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
