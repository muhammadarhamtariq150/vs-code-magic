import { memo } from "react";

interface AviatorHistoryProps {
  history: number[];
}

const AviatorHistory = memo(({ history }: AviatorHistoryProps) => {
  return (
    <div className="flex gap-1.5 overflow-x-auto py-2 px-3 scrollbar-hide">
      {history.map((h, i) => (
        <span
          key={i}
          className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${
            h >= 10
              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
              : h >= 2
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          }`}
        >
          {h.toFixed(2)}x
        </span>
      ))}
    </div>
  );
});

AviatorHistory.displayName = "AviatorHistory";
export default AviatorHistory;
