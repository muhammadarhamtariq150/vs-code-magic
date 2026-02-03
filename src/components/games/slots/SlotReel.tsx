import { memo } from "react";
import SlotSymbol, { Symbol } from "./SlotSymbol";

interface SlotReelProps {
  symbols: Symbol[];
  isSpinning?: boolean;
  winningRows?: number[];
}

const SlotReel = memo(({ symbols, isSpinning = false, winningRows = [] }: SlotReelProps) => {
  return (
    <div className="flex-1 relative">
      {/* Reel container - metallic silver gradient */}
      <div className="relative bg-gradient-to-b from-gray-300 via-white to-gray-300 rounded-md overflow-hidden shadow-inner border border-gray-400">
        {/* Top shadow overlay for depth */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/30 to-transparent z-10 pointer-events-none" />
        
        {/* Bottom shadow overlay for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none" />

        {/* Symbols container */}
        <div className="flex flex-col">
          {symbols.map((symbol, rowIndex) => (
            <div
              key={rowIndex}
              className={`
                relative h-20 sm:h-24 md:h-28 p-1
                ${rowIndex !== symbols.length - 1 ? "border-b border-gray-300" : ""}
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
