import { memo } from "react";

export interface Symbol {
  icon: string;
  name: string;
}

interface SlotSymbolProps {
  symbol: Symbol;
  isSpinning?: boolean;
  isWinning?: boolean;
}

const SlotSymbol = memo(({ symbol, isSpinning = false, isWinning = false }: SlotSymbolProps) => {
  return (
    <div
      className={`
        relative w-full aspect-square flex items-center justify-center
        bg-gradient-to-b from-amber-900/40 via-amber-950/60 to-amber-900/40
        border border-amber-600/30 rounded-lg
        transition-all duration-200
        ${isSpinning ? "blur-[2px] scale-105" : "blur-0"}
        ${isWinning ? "animate-pulse ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50" : ""}
      `}
    >
      {/* Inner glow */}
      <div className="absolute inset-1 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-md pointer-events-none" />
      
      {/* Symbol */}
      <span 
        className={`
          text-3xl sm:text-4xl md:text-5xl drop-shadow-lg
          transition-transform duration-200
          ${isWinning ? "scale-110" : ""}
        `}
      >
        {symbol.icon}
      </span>
      
      {/* Bottom reflection */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent rounded-b-lg" />
    </div>
  );
});

SlotSymbol.displayName = "SlotSymbol";

export default SlotSymbol;
