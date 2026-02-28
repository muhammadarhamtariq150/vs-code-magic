import { useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface ChickenRoadHeaderProps {
  balance: number;
  onHowToPlay: () => void;
}

const ChickenRoadHeader = ({ balance, onHowToPlay }: ChickenRoadHeaderProps) => {
  const navigate = useNavigate();
  const [onlineCount] = useState(() => Math.floor(20000 + Math.random() * 15000));
  const [liveWins, setLiveWins] = useState<{ user: string; amount: number }[]>([]);

  useEffect(() => {
    const names = ["Alex", "Raj", "Sam", "Priya", "Amit", "Zara", "Dev", "Neha", "Arjun", "Mia"];
    const generateWin = () => ({
      user: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 999),
      amount: parseFloat((Math.random() * 500 + 5).toFixed(2)),
    });

    setLiveWins(Array.from({ length: 5 }, generateWin));

    const interval = setInterval(() => {
      setLiveWins((prev) => [generateWin(), ...prev.slice(0, 4)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐔</span>
            <h1 className="text-xl font-black tracking-tight">
              <span className="text-white">CHICKEN</span>
              <span className="text-emerald-400">ROAD</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onHowToPlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2a3441] text-gray-300 text-sm hover:bg-[#344155] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            How to play?
          </button>
          <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#2a3441] border border-[#3a4a5c]">
            <span className="text-white font-bold">{balance.toFixed(2)}</span>
            <span className="text-yellow-400 font-bold">$</span>
          </div>
        </div>
      </div>

      {/* Live wins ticker */}
      <div className="flex items-center gap-4 px-4 py-1.5 text-xs text-gray-500 border-t border-[#1e2a36]">
        <span className="text-yellow-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
          Live wins
        </span>
        <span>Online: {onlineCount.toLocaleString()}</span>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-4 animate-marquee">
            {liveWins.map((win, i) => (
              <span key={i} className="whitespace-nowrap">
                <span className="text-gray-400">{win.user}</span>{" "}
                <span className="text-emerald-400">+${win.amount}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChickenRoadHeader;
