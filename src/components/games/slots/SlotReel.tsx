import { memo } from "react";
import SlotSymbol, { Symbol } from "./SlotSymbol";

interface SlotReelProps {
  symbols: Symbol[];
  isSpinning?: boolean;
  winningRows?: number[];
  reelIndex: number;
  jackpotValue?: number;
}

const SlotReel = memo(({ symbols, isSpinning = false, winningRows = [], reelIndex, jackpotValue }: SlotReelProps) => {
  return (
    <div className="flex flex-col items-center">
      {/* Jackpot counter above reel */}
      <div className="mb-1 px-2 py-0.5 bg-black/60 rounded-full border border-amber-500/40 min-w-[70px] text-center">
        <span className="text-[10px] sm:text-xs font-bold text-amber-400 tabular-nums">
          {jackpotValue?.toLocaleString() || "0"}
        </span>
      </div>
      
      {/* Reel frame */}
      <div className="relative">
        {/* Golden outer frame */}
        <div className="absolute -inset-1 bg-gradient-to-b from-yellow-500 via-amber-600 to-yellow-700 rounded-xl opacity-80" />
        
        {/* Inner dark frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-red-950 to-amber-900 rounded-lg" />
        
        {/* Reel content */}
        <div 
          className={`
            relative flex flex-col gap-1 p-1 sm:p-1.5 rounded-lg
            ${isSpinning ? "animate-pulse" : ""}
          `}
        >
          {symbols.map((symbol, rowIndex) => (
            <SlotSymbol
              key={`${reelIndex}-${rowIndex}`}
              symbol={symbol}
              isSpinning={isSpinning}
              isWinning={winningRows.includes(rowIndex)}
            />
          ))}
        </div>
        
        {/* Highlight line for middle row */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 pointer-events-none" />
      </div>
    </div>
  );
});

SlotReel.displayName = "SlotReel";

export default SlotReel;
