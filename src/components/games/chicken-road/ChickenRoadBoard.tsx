import { Flame, Skull } from "lucide-react";
import { useEffect, useState } from "react";

interface ChickenRoadBoardProps {
  isPlaying: boolean;
  gameOver: boolean;
  currentLane: number;
  lanes: boolean[][];
  revealedTiles: number[];
  multipliers: number[];
  onSelectTile: (laneIndex: number, tileIndex: number) => void;
  hitTrap: boolean;
  difficulty: string;
}

const ChickenRoadBoard = ({
  isPlaying,
  gameOver,
  currentLane,
  lanes,
  revealedTiles,
  multipliers,
  onSelectTile,
  hitTrap,
  difficulty,
}: ChickenRoadBoardProps) => {
  const [chickenBounce, setChickenBounce] = useState(false);

  useEffect(() => {
    if (currentLane >= 0) {
      setChickenBounce(true);
      const t = setTimeout(() => setChickenBounce(false), 400);
      return () => clearTimeout(t);
    }
  }, [currentLane]);

  const columns = difficulty === "hardcore" ? 5 : difficulty === "hard" ? 5 : difficulty === "medium" ? 5 : 5;

  if (!isPlaying && !gameOver) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4 animate-bounce">🐔</div>
          <p className="text-gray-400 text-lg font-medium">Place your bet and hit GO!</p>
          <p className="text-gray-600 text-sm mt-1">Help the chicken cross the road safely</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-3">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col-reverse gap-1.5">
          {multipliers.map((mult, laneIndex) => {
            const isActive = laneIndex === currentLane + 1 && isPlaying && !gameOver;
            const isPassed = laneIndex <= currentLane;
            const isHitLane = gameOver && hitTrap && laneIndex === currentLane;

            return (
              <div key={laneIndex} className="flex items-center gap-2">
                {/* Multiplier label */}
                <div
                  className={`w-14 text-center font-bold text-xs py-2 rounded-lg transition-all duration-300 ${
                    isPassed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : isActive
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 animate-pulse"
                      : "bg-[#1a2332] text-gray-600 border border-[#243040]"
                  }`}
                >
                  {mult.toFixed(2)}x
                </div>

                {/* Tiles */}
                <div className={`flex-1 grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                  {Array(columns)
                    .fill(0)
                    .map((_, tileIndex) => {
                      const isRevealed =
                        laneIndex < currentLane ||
                        (laneIndex === currentLane && revealedTiles[laneIndex] === tileIndex) ||
                        (gameOver && laneIndex <= currentLane + 1);
                      const isCurrentPath = revealedTiles[laneIndex] === tileIndex;
                      const isTrap = lanes[laneIndex]?.[tileIndex];
                      const canClick = isActive;

                      let tileClass = "bg-[#1a2332] border-[#243040]";

                      if (isRevealed && isTrap) {
                        tileClass = "bg-red-900/60 border-red-600/50";
                      } else if (isRevealed && isCurrentPath) {
                        tileClass = "bg-emerald-600/40 border-emerald-500/50";
                      } else if (isPassed && isRevealed && !isCurrentPath) {
                        tileClass = "bg-[#1e2d3d] border-[#2a3d50]";
                      } else if (canClick) {
                        tileClass =
                          "bg-[#1e3a2a] border-emerald-600/40 hover:bg-emerald-700/40 hover:border-emerald-500 cursor-pointer hover:scale-[1.03] active:scale-95";
                      }

                      return (
                        <button
                          key={tileIndex}
                          onClick={() => onSelectTile(laneIndex, tileIndex)}
                          disabled={!canClick}
                          className={`
                            aspect-[4/3] rounded-lg border transition-all duration-200 flex items-center justify-center
                            ${tileClass}
                          `}
                        >
                          {isRevealed && isTrap && (
                            <div className="animate-shake">
                              <Skull className="w-5 h-5 text-red-400" />
                            </div>
                          )}
                          {isRevealed && !isTrap && isCurrentPath && (
                            <span className={`text-xl ${chickenBounce && laneIndex === currentLane ? "animate-bounce" : ""}`}>
                              🐔
                            </span>
                          )}
                          {canClick && (
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cash out bar */}
        {isPlaying && !gameOver && currentLane >= 0 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-6 py-2">
              <span className="text-emerald-400 text-sm">Current multiplier:</span>
              <span className="text-emerald-300 font-bold text-lg">{multipliers[currentLane].toFixed(2)}x</span>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {gameOver && (
          <div className="mt-4 text-center">
            {hitTrap ? (
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-6 py-2">
                <Skull className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-bold">Shot down! You lost your bet</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-6 py-2">
                <span className="text-2xl">🎉</span>
                <span className="text-emerald-400 font-bold">
                  You won with {multipliers[currentLane].toFixed(2)}x!
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChickenRoadBoard;
