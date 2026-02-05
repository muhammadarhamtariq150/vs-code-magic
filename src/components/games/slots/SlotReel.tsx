import { memo } from "react";
import SlotSymbol, { Symbol } from "./SlotSymbol";

interface SlotReelProps {
  symbols: Symbol[];
  isSpinning?: boolean;
  winningRows?: number[];
  jackpotValue?: number;
}

const SlotReel = memo(({ symbols, isSpinning = false, winningRows = [], jackpotValue = 0 }: SlotReelProps) => {
  // Format jackpot value with spaces
  const formatJackpot = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Jackpot counter above reel */}
      <div className="w-full bg-gradient-to-b from-blue-600 to-blue-800 rounded-t-lg px-1 py-1 mb-1 border border-blue-400/50">
        <div className="bg-black/80 rounded px-1 py-0.5 text-center">
          <span className="text-[10px] sm:text-xs font-mono text-cyan-400 font-bold tracking-wider">
            {formatJackpot(jackpotValue)}
          </span>
        </div>
      </div>

      {/* Reel container */}
      <div className="relative w-full bg-gradient-to-b from-black via-gray-900 to-black rounded-lg overflow-hidden border-2 border-yellow-600/50 shadow-inner">
        {/* Top shadow overlay */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
        
        {/* Bottom shadow overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />

        {/* Symbols container */}
        <div className="flex flex-col">
          {symbols.map((symbol, rowIndex) => (
            <div
              key={rowIndex}
              className={`
                relative h-16 sm:h-20 md:h-24 p-0.5
                ${rowIndex !== symbols.length - 1 ? "border-b border-yellow-900/30" : ""}
              `}
            >
              <SlotSymbol
                symbol={symbol}
                isWinning={winningRows.includes(rowIndex)}
                isSpinning={isSpinning}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

SlotReel.displayName = "SlotReel";

export default SlotReel;
