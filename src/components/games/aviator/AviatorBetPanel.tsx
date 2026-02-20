import { memo, useState } from "react";
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
  autoCashOut: number;
  onAutoCashOutChange: (val: number) => void;
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
  autoCashOut,
  onAutoCashOutChange,
}: AviatorBetPanelProps) => {
  const [tab, setTab] = useState<"bet" | "auto">("bet");

  const adjustBet = (delta: number) => {
    const newAmount = Math.max(10, betAmount + delta);
    onBetChange(newAmount);
  };

  return (
    <div className="flex-1 bg-gray-900/80 rounded-xl p-3 border border-white/5">
      {/* Bet / Auto tabs */}
      <div className="flex bg-gray-800 rounded-full mb-3 p-0.5">
        <button
          onClick={() => setTab("bet")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors ${
            tab === "bet" ? "bg-gray-600 text-white" : "text-gray-400"
          }`}
        >
          Bet
        </button>
        <button
          onClick={() => setTab("auto")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors ${
            tab === "auto" ? "bg-gray-600 text-white" : "text-gray-400"
          }`}
        >
          Auto
        </button>
      </div>

      {tab === "auto" && (
        <div className="mb-2">
          <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Auto Cash Out at</label>
          <div className="flex items-center gap-1 mt-1 bg-gray-800 rounded-lg border border-white/10 px-2 py-1.5">
            <input
              type="number"
              value={autoCashOut || ""}
              onChange={(e) => onAutoCashOutChange(Number(e.target.value))}
              placeholder="e.g. 2.00"
              min={1.1}
              step={0.1}
              disabled={betPlaced}
              className="flex-1 bg-transparent text-white text-center font-bold text-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-white/40 text-xs font-bold">x</span>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-1.5">
            {[1.5, 2, 3, 5].map((v) => (
              <button
                key={v}
                onClick={() => onAutoCashOutChange(v)}
                disabled={betPlaced}
                className={`py-1 text-[11px] font-bold rounded-md border transition-colors disabled:opacity-40 ${
                  autoCashOut === v
                    ? "bg-green-600/30 text-green-400 border-green-500/30"
                    : "text-white/70 bg-gray-800 hover:bg-gray-700 border-white/5"
                }`}
              >
                {v.toFixed(1)}x
              </button>
            ))}
          </div>
        </div>
      )}

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
