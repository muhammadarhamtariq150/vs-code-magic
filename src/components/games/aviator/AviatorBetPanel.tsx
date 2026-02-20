import { memo } from "react";
import { Minus, Plus } from "lucide-react";

interface AviatorBetPanelProps {
  betAmount: number;
  onBetChange: (amount: number) => void;
  onBet: () => void;
  onCashOut: () => void;
  isFlying: boolean;
  hasCashedOut: boolean;
  betPlaced: boolean;
  multiplier: number;
  disabled?: boolean;
  panelLabel: string;
}

const QUICK_BETS = [100, 500, 1000, 5000];

const AviatorBetPanel = memo(({
  betAmount,
  onBetChange,
  onBet,
  onCashOut,
  isFlying,
  hasCashedOut,
  betPlaced,
  multiplier,
  disabled,
  panelLabel,
}: AviatorBetPanelProps) => {
  const adjustBet = (delta: number) => {
    const newAmount = Math.max(10, betAmount + delta);
    onBetChange(newAmount);
  };

  return (
    <div className="flex-1 bg-gray-900/80 rounded-xl p-3 border border-white/5">
      {/* Bet / Auto tabs */}
      <div className="flex bg-gray-800 rounded-full mb-3 p-0.5">
        <button className="flex-1 py-1.5 text-xs font-bold rounded-full bg-gray-600 text-white">
          Bet
        </button>
        <button className="flex-1 py-1.5 text-xs font-bold rounded-full text-gray-400">
          Auto
        </button>
      </div>

      {/* Amount controls */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center flex-1 bg-gray-800 rounded-lg border border-white/10">
          <button
            onClick={() => adjustBet(-50)}
            className="p-2 text-white/60 hover:text-white transition-colors"
            disabled={betPlaced}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="flex-1 text-center font-bold text-white text-lg">
            {betAmount.toFixed(2)}
          </span>
          <button
            onClick={() => adjustBet(50)}
            className="p-2 text-white/60 hover:text-white transition-colors"
            disabled={betPlaced}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Main action button */}
        {isFlying && betPlaced && !hasCashedOut ? (
          <button
            onClick={onCashOut}
            className="flex-1 py-3 rounded-xl font-black text-black text-sm bg-gradient-to-b from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
          >
            <div className="text-[10px] font-bold opacity-80">CASH OUT</div>
            <div className="text-base">{(betAmount * multiplier).toFixed(2)} Rs.</div>
          </button>
        ) : (
          <button
            onClick={onBet}
            disabled={betPlaced || disabled}
            className={`flex-1 py-3 rounded-xl font-black text-white text-sm transition-all active:scale-95 ${
              betPlaced || disabled
                ? "bg-gray-700 opacity-50 cursor-not-allowed"
                : "bg-gradient-to-b from-green-500 to-green-700 shadow-lg shadow-green-500/30 hover:from-green-400 hover:to-green-600"
            }`}
          >
            <div className="text-[10px] font-bold opacity-80">BET</div>
            <div className="text-base">{betAmount.toFixed(2)} Rs.</div>
          </button>
        )}
      </div>

      {/* Quick bet buttons */}
      <div className="grid grid-cols-4 gap-1">
        {QUICK_BETS.map((amount) => (
          <button
            key={amount}
            onClick={() => onBetChange(amount)}
            disabled={betPlaced}
            className="py-1 text-[11px] font-bold text-white/70 bg-gray-800 hover:bg-gray-700 rounded-md border border-white/5 transition-colors disabled:opacity-40"
          >
            {amount.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  );
});

AviatorBetPanel.displayName = "AviatorBetPanel";
export default AviatorBetPanel;
