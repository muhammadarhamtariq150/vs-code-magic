import { memo } from "react";

export interface Symbol {
  icon: string;
  name: string;
  isBar?: boolean;
}

interface SlotSymbolProps {
  symbol: Symbol;
  isSpinning?: boolean;
  isWinning?: boolean;
}

const SlotSymbol = memo(({ symbol, isSpinning = false, isWinning = false }: SlotSymbolProps) => {
  // BAR symbol - blue text on white background
  if (symbol.isBar) {
    return (
      <div
        className={`
          relative w-full h-full flex items-center justify-center
          bg-gradient-to-b from-white via-gray-100 to-gray-200
          border-2 border-blue-900 rounded-md shadow-inner
          transition-all duration-200
          ${isSpinning ? "blur-[3px]" : "blur-0"}
          ${isWinning ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50 scale-105" : ""}
        `}
      >
        <span 
          className="text-xl sm:text-2xl md:text-3xl font-black text-blue-900 tracking-tighter"
          style={{ fontFamily: 'Arial Black, Impact, sans-serif' }}
        >
          BAR
        </span>
        {isWinning && (
          <div className="absolute inset-0 bg-yellow-400/20 animate-pulse rounded-md" />
        )}
      </div>
    );
  }

  // 7 symbol - fiery red
  if (symbol.name === "Seven") {
    return (
      <div
        className={`
          relative w-full h-full flex items-center justify-center
          bg-gradient-to-b from-white via-gray-50 to-gray-200
          rounded-md shadow-inner
          transition-all duration-200
          ${isSpinning ? "blur-[3px]" : "blur-0"}
          ${isWinning ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50 scale-105" : ""}
        `}
      >
        <span 
          className="text-4xl sm:text-5xl md:text-6xl font-black"
          style={{ 
            fontFamily: 'Arial Black, Impact, sans-serif',
            color: '#ff2222',
            textShadow: '2px 2px 0 #aa0000, -1px -1px 0 #ff6600, 0 0 15px rgba(255,100,0,0.6)',
          }}
        >
          7
        </span>
        {isWinning && (
          <div className="absolute inset-0 bg-orange-400/20 animate-pulse rounded-md" />
        )}
      </div>
    );
  }

  // RESPIN symbol
  if (symbol.name === "Respin") {
    return (
      <div
        className={`
          relative w-full h-full flex flex-col items-center justify-center
          bg-gradient-to-b from-cream-100 via-amber-50 to-amber-100
          border border-amber-600 rounded-md
          transition-all duration-200
          ${isSpinning ? "blur-[3px]" : "blur-0"}
          ${isWinning ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50 scale-105" : ""}
        `}
      >
        <span className="text-sm sm:text-base font-black text-amber-800" style={{ fontFamily: 'serif' }}>
          RESPIN
        </span>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-purple-700 mt-0.5" />
      </div>
    );
  }

  // Default emoji symbols
  return (
    <div
      className={`
        relative w-full h-full flex items-center justify-center
        bg-gradient-to-b from-white via-gray-100 to-gray-200
        rounded-md shadow-inner
        transition-all duration-200
        ${isSpinning ? "blur-[3px]" : "blur-0"}
        ${isWinning ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50 scale-105" : ""}
      `}
    >
      <span className="text-3xl sm:text-4xl md:text-5xl">{symbol.icon}</span>
      {isWinning && (
        <div className="absolute inset-0 bg-yellow-400/20 animate-pulse rounded-md" />
      )}
    </div>
  );
});

SlotSymbol.displayName = "SlotSymbol";

export default SlotSymbol;
