import { Minus, Plus } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard" | "hardcore";

interface ChickenRoadControlsProps {
  betAmount: string;
  setBetAmount: (val: string) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  isPlaying: boolean;
  gameOver: boolean;
  currentLane: number;
  currentMultiplier: number;
  betValue: number;
  onStart: () => void;
  onCashOut: () => void;
}

const quickBets = [0.5, 1, 2, 7];

const difficultyConfig: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: "Easy", color: "bg-emerald-500" },
  medium: { label: "Medium", color: "bg-yellow-500" },
  hard: { label: "Hard", color: "bg-orange-500" },
  hardcore: { label: "Hardcore", color: "bg-red-500" },
};

const ChickenRoadControls = ({
  betAmount,
  setBetAmount,
  difficulty,
  setDifficulty,
  isPlaying,
  gameOver,
  currentLane,
  currentMultiplier,
  betValue,
  onStart,
  onCashOut,
}: ChickenRoadControlsProps) => {
  const adjustBet = (delta: number) => {
    const current = parseFloat(betAmount) || 0;
    const next = Math.max(0.5, current + delta);
    setBetAmount(next.toString());
  };

  const showCashOut = isPlaying && !gameOver && currentLane >= 0;
  const showGo = !isPlaying || gameOver;

  return (
    <div className="w-full border-t border-[#1e2a36] bg-[#131d27]">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Bet amount */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustBet(-1)}
              disabled={isPlaying && !gameOver}
              className="w-10 h-10 rounded-lg bg-[#1e2a36] border border-[#2a3a4c] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a3a4c] transition-colors disabled:opacity-40"
            >
              MIN
            </button>
            <div className="relative">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={isPlaying && !gameOver}
                className="w-20 h-10 text-center bg-[#1e2a36] border border-[#2a3a4c] rounded-lg text-white font-bold text-lg focus:outline-none focus:border-emerald-500 disabled:opacity-40"
              />
            </div>
            <button
              onClick={() => adjustBet(1)}
              disabled={isPlaying && !gameOver}
              className="w-10 h-10 rounded-lg bg-[#1e2a36] border border-[#2a3a4c] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a3a4c] transition-colors disabled:opacity-40"
            >
              MAX
            </button>
          </div>

          {/* Quick bets */}
          <div className="flex items-center gap-1.5">
            {quickBets.map((val) => (
              <button
                key={val}
                onClick={() => setBetAmount(val.toString())}
                disabled={isPlaying && !gameOver}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  parseFloat(betAmount) === val
                    ? "bg-yellow-500 text-black"
                    : "bg-[#1e2a36] text-gray-400 hover:bg-[#2a3a4c] hover:text-white"
                } disabled:opacity-40`}
              >
                {val}$
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">Difficulty</span>
            <div className="flex items-center gap-1">
              {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  disabled={isPlaying && !gameOver}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    difficulty === diff
                      ? "bg-[#2a3a4c] text-white border border-[#3a5060]"
                      : "text-gray-500 hover:text-gray-300"
                  } disabled:opacity-40`}
                >
                  {difficultyConfig[diff].label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-gray-600">Chance of being shot down</span>
          </div>

          {/* GO / Cash Out button */}
          <div className="ml-auto">
            {showGo ? (
              <button
                onClick={onStart}
                className="px-12 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xl tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                GO
              </button>
            ) : showCashOut ? (
              <button
                onClick={onCashOut}
                className="px-8 py-3 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/20 animate-pulse"
              >
                CASH OUT ${(betValue * currentMultiplier).toFixed(2)}
              </button>
            ) : (
              <button
                disabled
                className="px-12 py-3 rounded-2xl bg-gray-700 text-gray-500 font-black text-xl cursor-not-allowed"
              >
                GO
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChickenRoadControls;
