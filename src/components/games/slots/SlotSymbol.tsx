import { memo } from "react";

export interface Symbol {
  icon: string;
  name: string;
}

// Fruit symbols matching the reference
export const SLOT_SYMBOLS: Symbol[] = [
  { icon: "🍒", name: "Cherry" },
  { icon: "🍋", name: "Lemon" },
  { icon: "🍇", name: "Grape" },
  { icon: "🍊", name: "Orange" },
  { icon: "⭐", name: "Star" },
  { icon: "🥝", name: "Kiwi" },
  { icon: "7️⃣", name: "Seven" },
];

interface SlotSymbolProps {
  symbol: Symbol;
  isSpinning?: boolean;
  isWinning?: boolean;
}

const SlotSymbol = memo(({ symbol, isSpinning = false, isWinning = false }: SlotSymbolProps) => {
  // Seven symbol - special fiery red styling
  if (symbol.name === "Seven") {
    return (
      <div
        className={`
          relative w-full h-full flex items-center justify-center
          bg-gradient-to-b from-red-900 via-red-800 to-red-900
          rounded-lg
          transition-all duration-200
          ${isSpinning ? "blur-[2px]" : "blur-0"}
          ${isWinning ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50 scale-105" : ""}
        `}
      >
        <span 
          className="text-5xl sm:text-6xl md:text-7xl font-black drop-shadow-lg"
          style={{ 
            color: '#ff3333',
            textShadow: '3px 3px 0 #aa0000, -2px -2px 0 #ff6600, 0 0 20px rgba(255,100,0,0.8)',
          }}
        >
          7
        </span>
        {isWinning && (
          <div className="absolute inset-0 bg-yellow-400/30 animate-pulse rounded-lg" />
        )}
      </div>
    );
  }

  // Default fruit symbols
  return (
    <div
      className={`
        relative w-full h-full flex items-center justify-center
        bg-gradient-to-b from-red-900 via-red-800 to-red-900
        rounded-lg
        transition-all duration-200
        ${isSpinning ? "blur-[2px]" : "blur-0"}
        ${isWinning ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50 scale-105" : ""}
      `}
    >
      <span className="text-4xl sm:text-5xl md:text-6xl drop-shadow-lg">{symbol.icon}</span>
      {isWinning && (
        <div className="absolute inset-0 bg-yellow-400/30 animate-pulse rounded-lg" />
      )}
    </div>
  );
});

SlotSymbol.displayName = "SlotSymbol";

export default SlotSymbol;
