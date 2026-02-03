import { memo } from "react";
import SlotReel from "./SlotReel";
import { Symbol } from "./SlotSymbol";

interface SlotMachineProps {
  reels: Symbol[][];
  spinningReels: boolean[];
  winningPositions: { reel: number; row: number }[];
}

const SlotMachine = memo(({ reels, spinningReels, winningPositions }: SlotMachineProps) => {
  const getWinningRowsForReel = (reelIndex: number) => {
    return winningPositions
      .filter(pos => pos.reel === reelIndex)
      .map(pos => pos.row);
  };

  return (
    <div className="relative">
      {/* Main slot machine frame - dark metallic */}
      <div className="relative bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-2xl p-3 sm:p-4 shadow-2xl border-4 border-gray-600">
        
        {/* Inner chrome frame */}
        <div className="relative bg-gradient-to-b from-gray-500 via-gray-600 to-gray-700 rounded-xl p-2 sm:p-3 border-2 border-gray-400">
          
          {/* Top chrome highlight */}
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full" />
          
          {/* Reel window with payline */}
          <div className="relative flex items-center">
            {/* Left payline arrow - yellow */}
            <div className="absolute -left-5 sm:-left-7 top-1/2 -translate-y-1/2 z-20">
              <div 
                className="w-0 h-0 border-t-[14px] border-b-[14px] border-l-[18px] sm:border-t-[18px] sm:border-b-[18px] sm:border-l-[24px] border-t-transparent border-b-transparent border-l-yellow-400"
                style={{ filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.8))' }}
              />
            </div>

            {/* Right payline arrow - yellow */}
            <div className="absolute -right-5 sm:-right-7 top-1/2 -translate-y-1/2 z-20">
              <div 
                className="w-0 h-0 border-t-[14px] border-b-[14px] border-r-[18px] sm:border-t-[18px] sm:border-b-[18px] sm:border-r-[24px] border-t-transparent border-b-transparent border-r-yellow-400"
                style={{ filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.8))' }}
              />
            </div>

            {/* Payline horizontal glow line */}
            <div 
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-yellow-400 z-10 pointer-events-none" 
              style={{ boxShadow: '0 0 10px rgba(250, 204, 21, 0.9), 0 0 20px rgba(250, 204, 21, 0.5)' }} 
            />

            {/* Reels container */}
            <div className="flex gap-1 sm:gap-2 w-full px-1">
              {reels.map((reelSymbols, reelIndex) => (
                <SlotReel
                  key={reelIndex}
                  symbols={reelSymbols}
                  isSpinning={spinningReels[reelIndex]}
                  winningRows={getWinningRowsForReel(reelIndex)}
                />
              ))}
            </div>
          </div>

          {/* Bottom orange triangle decorations */}
          <div className="flex justify-center gap-0.5 mt-2">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-orange-500"
              />
            ))}
          </div>
        </div>

        {/* Side decorative lights */}
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"
              style={{ animationDelay: `${i * 0.15 + 0.08}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

SlotMachine.displayName = "SlotMachine";

export default SlotMachine;
