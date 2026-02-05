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
      {/* Outer golden frame with coins decoration */}
      <div className="relative bg-gradient-to-b from-yellow-600 via-yellow-500 to-yellow-700 rounded-2xl p-2 sm:p-3 shadow-2xl">
        {/* Decorative coins on corners */}
        <div className="absolute -top-2 -left-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300 flex items-center justify-center shadow-lg z-20">
          <span className="text-lg sm:text-xl">🪙</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300 flex items-center justify-center shadow-lg z-20">
          <span className="text-lg sm:text-xl">🪙</span>
        </div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300 flex items-center justify-center shadow-lg z-20">
          <span className="text-lg sm:text-xl">🪙</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-300 flex items-center justify-center shadow-lg z-20">
          <span className="text-lg sm:text-xl">🪙</span>
        </div>

        {/* Inner red background */}
        <div className="relative bg-gradient-to-b from-red-700 via-red-800 to-red-900 rounded-xl p-2 sm:p-3 border-4 border-yellow-500/50">
          
          {/* Sparkle effects */}
          <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-75" />
          <div className="absolute top-4 right-6 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-4 left-8 w-1 h-1 bg-white rounded-full animate-ping opacity-50" style={{ animationDelay: '1s' }} />

          {/* 5 Reels container */}
          <div className="flex gap-1 sm:gap-2">
            {reels.map((reelSymbols, reelIndex) => (
              <SlotReel
                key={reelIndex}
                symbols={reelSymbols}
                isSpinning={spinningReels[reelIndex]}
                winningRows={getWinningRowsForReel(reelIndex)}
                jackpotValue={jackpotValues[reelIndex]}
              />
            ))}
          </div>

          {/* Center payline indicator */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />
          </div>
        </div>

        {/* Side LED lights */}
        <div className="absolute left-0.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50"
              style={{ animationDelay: `${i * 0.2 + 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

SlotMachine.displayName = "SlotMachine";

export default SlotMachine;
