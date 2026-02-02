import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import WalletDisplay from "@/components/games/WalletDisplay";
import { toast } from "sonner";

const SYMBOLS = [
  { icon: "🍒", name: "Cherry", color: "from-red-500 to-red-700" },
  { icon: "🍋", name: "Lemon", color: "from-yellow-400 to-yellow-600" },
  { icon: "🍊", name: "Orange", color: "from-orange-400 to-orange-600" },
  { icon: "🍇", name: "Grape", color: "from-purple-500 to-purple-700" },
  { icon: "💎", name: "Diamond", color: "from-cyan-400 to-blue-600" },
  { icon: "7️⃣", name: "Seven", color: "from-red-600 to-red-800" },
  { icon: "⭐", name: "Star", color: "from-yellow-300 to-amber-500" },
];

const PAYOUTS: Record<string, number> = {
  "🍒": 2,
  "🍋": 3,
  "🍊": 4,
  "🍇": 5,
  "💎": 10,
  "7️⃣": 20,
  "⭐": 50,
};

const BET_OPTIONS = [10, 25, 50, 100, 250, 500];

const Slots777 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [reels, setReels] = useState<string[]>(["7️⃣", "7️⃣", "7️⃣"]);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [spinAnimation, setSpinAnimation] = useState([false, false, false]);
  const [showJackpot, setShowJackpot] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].icon;

  const spin = async () => {
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

    setSpinning(true);
    setLastWin(null);
    setShowJackpot(false);
    setSpinAnimation([true, true, true]);

    // Staggered reel stop animation
    const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // First reel stops
    setTimeout(() => {
      setReels(prev => [finalReels[0], prev[1], prev[2]]);
      setSpinAnimation(prev => [false, prev[1], prev[2]]);
    }, 800);

    // Second reel stops
    setTimeout(() => {
      setReels(prev => [prev[0], finalReels[1], prev[2]]);
      setSpinAnimation(prev => [prev[0], false, prev[2]]);
    }, 1200);

    // Third reel stops and check win
    setTimeout(() => {
      setReels(finalReels);
      setSpinAnimation([false, false, false]);
      setSpinning(false);
      checkWin(finalReels);
    }, 1600);

    // Spinning animation
    let spins = 0;
    const spinInterval = setInterval(() => {
      setReels(prev => [
        spinAnimation[0] ? getRandomSymbol() : prev[0],
        spinAnimation[1] ? getRandomSymbol() : prev[1],
        spinAnimation[2] ? getRandomSymbol() : prev[2],
      ]);
      spins++;
      if (spins > 15) clearInterval(spinInterval);
    }, 80);
  };

  const checkWin = async (finalReels: string[]) => {
    if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
      const winAmount = betAmount * PAYOUTS[finalReels[0]];
      await updateBalance(balance - betAmount + winAmount);
      await recordTransaction("Slots 777", betAmount, winAmount, "win");
      setLastWin(winAmount);
      setShowJackpot(true);
      
      if (finalReels[0] === "⭐") {
        toast.success(`🌟 MEGA JACKPOT! ₨${winAmount}! 🌟`, { duration: 5000 });
      } else if (finalReels[0] === "7️⃣") {
        toast.success(`🎰 LUCKY 777! ₨${winAmount}! 🎰`, { duration: 4000 });
      } else {
        toast.success(`Triple ${finalReels[0]}! Won ₨${winAmount}!`);
      }
    } else if (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2]) {
      const matchSymbol = finalReels[0] === finalReels[1] ? finalReels[0] : finalReels[1];
      const winAmount = Math.floor(betAmount * (PAYOUTS[matchSymbol] / 4));
      await updateBalance(balance - betAmount + winAmount);
      await recordTransaction("Slots 777", betAmount, winAmount, "win");
      setLastWin(winAmount);
      toast.success(`Two match! Won ₨${winAmount}!`);
    } else {
      await recordTransaction("Slots 777", betAmount, 0, "loss");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoSpin && !spinning && balance >= betAmount) {
      interval = setTimeout(() => spin(), 1500);
    }
    return () => clearTimeout(interval);
  }, [autoSpin, spinning, balance, betAmount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-3 sm:p-4 bg-black/40 backdrop-blur-sm border-b border-yellow-500/20">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
        >
          <ArrowLeft className="w-5 h-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
          <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 bg-clip-text text-transparent tracking-wider">
            SLOTS 777
          </h1>
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-pulse" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-yellow-400 hover:text-yellow-300"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <WalletDisplay />
        </div>
      </div>

      {/* Main Game Container */}
      <div className="relative z-10 container max-w-lg mx-auto p-3 sm:p-4">
        {/* Jackpot Display */}
        <div className="mb-4 sm:mb-6 text-center">
          <div className="inline-block px-4 sm:px-8 py-2 sm:py-3 rounded-full bg-gradient-to-r from-yellow-600/20 via-yellow-500/30 to-yellow-600/20 border border-yellow-500/50">
            <p className="text-xs sm:text-sm text-yellow-400/80 uppercase tracking-widest">Grand Jackpot</p>
            <p className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-400 animate-pulse">
              ₨{(balance * 50).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Slot Machine Frame */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/50 via-orange-500/50 to-yellow-500/50 rounded-2xl blur-lg opacity-60" />
          
          {/* Machine body */}
          <div className="relative bg-gradient-to-b from-[#2a1a3e] via-[#1a0a2e] to-[#0a0a1a] rounded-2xl border-2 border-yellow-500/40 overflow-hidden shadow-2xl">
            {/* Top decorative bar */}
            <div className="h-2 bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500" />
            
            {/* Reels Container */}
            <div className="p-4 sm:p-6">
              <div className="relative bg-black/60 rounded-xl p-3 sm:p-4 border border-yellow-500/30">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 via-transparent to-yellow-500/10 rounded-xl pointer-events-none" />
                
                {/* Reels */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {reels.map((symbol, i) => (
                    <div key={i} className="relative">
                      {/* Reel frame */}
                      <div className="absolute -inset-1 bg-gradient-to-b from-yellow-600 via-yellow-500 to-yellow-600 rounded-lg opacity-80" />
                      
                      {/* Reel window */}
                      <div
                        className={`relative w-20 h-24 sm:w-24 sm:h-28 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-lg flex items-center justify-center overflow-hidden ${
                          spinAnimation[i] ? "animate-pulse" : ""
                        }`}
                      >
                        {/* Spinning blur effect */}
                        {spinAnimation[i] && (
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse" />
                        )}
                        
                        {/* Symbol */}
                        <span 
                          className={`text-4xl sm:text-5xl transition-all duration-200 ${
                            spinAnimation[i] ? "blur-sm scale-110" : "blur-0 scale-100"
                          } ${!spinning && lastWin ? "animate-bounce" : ""}`}
                        >
                          {symbol}
                        </span>
                        
                        {/* Reflection effect */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Win line indicator */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500 opacity-50" />
                  <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                </div>
              </div>

              {/* Win Display */}
              {lastWin !== null && (
                <div className={`mt-4 text-center p-3 sm:p-4 rounded-xl transition-all duration-500 ${
                  showJackpot 
                    ? "bg-gradient-to-r from-yellow-500/30 via-orange-500/40 to-yellow-500/30 border border-yellow-400/50 animate-pulse" 
                    : "bg-green-500/20 border border-green-500/30"
                }`}>
                  <p className={`text-xl sm:text-3xl font-black ${
                    showJackpot 
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-400" 
                      : "text-green-400"
                  }`}>
                    {showJackpot ? "🎰 JACKPOT! 🎰" : "WIN!"}
                  </p>
                  <p className="text-2xl sm:text-4xl font-black text-white mt-1">₨{lastWin.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Controls Section */}
            <div className="bg-gradient-to-b from-[#1a0a2e] to-[#0a0a1a] p-4 sm:p-6 border-t border-yellow-500/20">
              {/* Bet Selection */}
              <div className="mb-4">
                <p className="text-xs text-yellow-400/60 uppercase tracking-wider mb-2 text-center">Select Bet</p>
                <div className="grid grid-cols-6 gap-1 sm:gap-2">
                  {BET_OPTIONS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      disabled={spinning}
                      className={`py-2 px-1 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 ${
                        betAmount === amount
                          ? "bg-gradient-to-b from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/30 scale-105"
                          : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-600"
                      }`}
                    >
                      ₨{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Bet Display */}
              <div className="flex justify-between items-center mb-4 px-2">
                <div>
                  <p className="text-xs text-gray-400">Current Bet</p>
                  <p className="text-lg sm:text-xl font-bold text-yellow-400">₨{betAmount}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Potential Win</p>
                  <p className="text-lg sm:text-xl font-bold text-green-400">₨{(betAmount * 50).toLocaleString()}</p>
                </div>
              </div>

              {/* Spin Button */}
              <button
                onClick={spin}
                disabled={spinning}
                className={`relative w-full py-4 sm:py-5 rounded-xl font-black text-xl sm:text-2xl uppercase tracking-wider transition-all duration-300 overflow-hidden ${
                  spinning
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-b from-yellow-400 via-yellow-500 to-orange-600 text-black hover:from-yellow-300 hover:via-yellow-400 hover:to-orange-500 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-yellow-500/30"
                }`}
              >
                {/* Shine effect */}
                {!spinning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                )}
                <span className="relative z-10">{spinning ? "⚡ SPINNING ⚡" : "🎰 SPIN 🎰"}</span>
              </button>

              {/* Auto Spin Toggle */}
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => setAutoSpin(!autoSpin)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    autoSpin
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-gray-800/50 text-gray-400 border border-gray-600 hover:border-gray-500"
                  }`}
                >
                  {autoSpin ? "⏹ Stop Auto" : "🔄 Auto Spin"}
                </button>
              </div>
            </div>

            {/* Payouts Section */}
            <div className="bg-black/40 p-3 sm:p-4 border-t border-yellow-500/10">
              <p className="text-xs text-yellow-400/60 uppercase tracking-wider mb-2 text-center">Triple Match Payouts</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {SYMBOLS.map((s) => (
                  <div key={s.icon} className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-lg">
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-xs font-bold text-yellow-400">{PAYOUTS[s.icon]}x</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-2">Two matches pay 1/4 of triple payout</p>
            </div>

            {/* Bottom decorative bar */}
            <div className="h-2 bg-gradient-to-r from-yellow-500 via-orange-400 to-yellow-500" />
          </div>
        </div>
      </div>

      {/* Custom shimmer animation */}
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
