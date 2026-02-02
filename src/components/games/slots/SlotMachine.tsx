import { memo } from "react";
import SlotReel from "./SlotReel";
import { Symbol } from "./SlotSymbol";

interface SlotMachineProps {
  reels: Symbol[][];
  spinningReels: boolean[];
  winningPositions: { reel: number; row: number }[];
  jackpotValues: number[];
}

const SlotMachine = memo(({ reels, spinningReels, winningPositions, jackpotValues }: SlotMachineProps) => {
  const getWinningRowsForReel = (reelIndex: number) => {
    return winningPositions
      .filter(pos => pos.reel === reelIndex)
      .map(pos => pos.row);
  };

  return (
    <div className="relative">
      {/* Outer glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/30 via-red-500/40 to-yellow-500/30 rounded-3xl blur-xl opacity-60" />
      
      {/* Main machine frame */}
      <div className="relative">
        {/* Gold decorative border */}
        <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-600 rounded-2xl" />
        
        {/* Inner red frame */}
        <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-b from-red-700 via-red-900 to-red-800 rounded-xl" />
        
        {/* Machine body */}
        <div className="relative bg-gradient-to-b from-red-900 via-red-950 to-red-900 rounded-xl p-2 sm:p-3 border border-amber-500/40">
          {/* Top decoration bar */}
          <div className="absolute -top-1 left-4 right-4 h-2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full opacity-60" />
          
          {/* Sparkle particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                  opacity: 0.4 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>
          
          {/* Reels container */}
          <div className="flex justify-center gap-1 sm:gap-2">
            {reels.map((reelSymbols, reelIndex) => (
              <SlotReel
                key={reelIndex}
                reelIndex={reelIndex}
                symbols={reelSymbols}
                isSpinning={spinningReels[reelIndex]}
                winningRows={getWinningRowsForReel(reelIndex)}
                jackpotValue={jackpotValues[reelIndex]}
              />
            ))}
          </div>
          
          {/* Bottom decoration */}
          <div className="mt-2 sm:mt-3 flex justify-center">
            <div className="px-4 sm:px-8 py-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-full">
              <span className="text-xs sm:text-sm font-black text-red-900 uppercase tracking-wider">
                Many Rewarding Slots!
              </span>
            </div>
          </div>
        </div>
        
        {/* Corner gold coins decoration */}
        <div className="absolute -bottom-2 -left-2 text-2xl sm:text-3xl opacity-80">🪙</div>
        <div className="absolute -bottom-2 -right-2 text-2xl sm:text-3xl opacity-80">🪙</div>
        <div className="absolute -top-2 -left-2 text-xl sm:text-2xl opacity-60">✨</div>
        <div className="absolute -top-2 -right-2 text-xl sm:text-2xl opacity-60">✨</div>
      </div>
    </div>
  );
});

SlotMachine.displayName = "SlotMachine";

export default SlotMachine;
