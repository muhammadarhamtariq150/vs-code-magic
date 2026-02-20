import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/hooks/useAuth";
import { useAviatorSound } from "@/hooks/useAviatorSound";
import WalletDisplay from "@/components/games/WalletDisplay";
import AviatorGraph from "@/components/games/aviator/AviatorGraph";
import AviatorHistory from "@/components/games/aviator/AviatorHistory";
import AviatorBetPanel from "@/components/games/aviator/AviatorBetPanel";
import { toast } from "sonner";

const Aviator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, updateBalance, recordTransaction } = useWallet();
  const sound = useAviatorSound();

  const [betAmount1, setBetAmount1] = useState(300);
  const [betAmount2, setBetAmount2] = useState(300);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isFlying, setIsFlying] = useState(false);
  const [hasCashedOut1, setHasCashedOut1] = useState(false);
  const [hasCashedOut2, setHasCashedOut2] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [betPlaced1, setBetPlaced1] = useState(false);
  const [betPlaced2, setBetPlaced2] = useState(false);
  const [history, setHistory] = useState<number[]>([2.96, 4.30, 5.15, 1.48, 1.09, 1.83, 4.96, 4.99, 1.46, 2.90, 4.63, 1.31, 11.14, 4.41]);
  const [roundId, setRoundId] = useState(Math.floor(10000000 + Math.random() * 90000000));
  const [gamePhase, setGamePhase] = useState<"waiting" | "flying" | "crashed">("waiting");

  const crashPointRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const multiplierRef = useRef(1.0);

  // Auto-start rounds
  const startRound = useCallback(async () => {
    setGamePhase("waiting");
    setCrashed(false);
    setHasCashedOut1(false);
    setHasCashedOut2(false);
    setMultiplier(1.0);
    multiplierRef.current = 1.0;

    // Generate crash point
    crashPointRef.current = 1 + Math.random() * Math.random() * 15;

    // Brief waiting period
    await new Promise((r) => setTimeout(r, 2500));

    // Takeoff
    setGamePhase("flying");
    setIsFlying(true);
    sound.playTakeoff();

    setTimeout(() => {
      sound.startFlyingSound();
    }, 600);

    intervalRef.current = setInterval(() => {
      multiplierRef.current += 0.01 + multiplierRef.current * 0.004;
      const newMult = Number(multiplierRef.current.toFixed(2));

      if (newMult >= crashPointRef.current) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setMultiplier(Number(crashPointRef.current.toFixed(2)));
        handleCrash();
        return;
      }

      setMultiplier(newMult);
      sound.updateFlyingPitch(newMult);
    }, 40);
  }, [sound]);

  const handleCrash = useCallback(async () => {
    setIsFlying(false);
    setCrashed(true);
    setGamePhase("crashed");
    sound.playCrash();

    const crashPoint = Number(crashPointRef.current.toFixed(2));
    setHistory((prev) => [crashPoint, ...prev.slice(0, 19)]);
    setRoundId((prev) => prev + 1);

    // Settle unexited bets
    if (betPlaced1 && !hasCashedOut1) {
      await recordTransaction("Aviator", betAmount1, 0, "loss");
    }
    if (betPlaced2 && !hasCashedOut2) {
      await recordTransaction("Aviator", betAmount2, 0, "loss");
    }

    setBetPlaced1(false);
    setBetPlaced2(false);

    toast.error(`💥 Flew away at ${crashPoint}x!`);

    // Auto restart
    setTimeout(() => startRound(), 3000);
  }, [betPlaced1, betPlaced2, hasCashedOut1, hasCashedOut2, betAmount1, betAmount2, recordTransaction, sound, startRound]);

  // Place bet on panel 1
  const placeBet1 = async () => {
    if (!user) return toast.error("Please login to play");
    if (betAmount1 > balance) return toast.error("Insufficient balance");
    const success = await updateBalance(balance - betAmount1);
    if (!success) return toast.error("Failed to place bet");
    setBetPlaced1(true);
    sound.playBet();
  };

  // Place bet on panel 2
  const placeBet2 = async () => {
    if (!user) return toast.error("Please login to play");
    if (betAmount2 > balance) return toast.error("Insufficient balance");
    const success = await updateBalance(balance - betAmount2);
    if (!success) return toast.error("Failed to place bet");
    setBetPlaced2(true);
    sound.playBet();
  };

  // Cash out panel 1
  const cashOut1 = async () => {
    if (!isFlying || hasCashedOut1 || !betPlaced1) return;
    setHasCashedOut1(true);
    const winAmount = betAmount1 * multiplier;
    await updateBalance(balance + winAmount);
    await recordTransaction("Aviator", betAmount1, winAmount, "win");
    sound.playCashOut();
    toast.success(`✈️ Cashed out at ${multiplier.toFixed(2)}x! Won ₨${winAmount.toFixed(2)}!`);
  };

  // Cash out panel 2
  const cashOut2 = async () => {
    if (!isFlying || hasCashedOut2 || !betPlaced2) return;
    setHasCashedOut2(true);
    const winAmount = betAmount2 * multiplier;
    await updateBalance(balance + winAmount);
    await recordTransaction("Aviator", betAmount2, winAmount, "win");
    sound.playCashOut();
    toast.success(`✈️ Cashed out at ${multiplier.toFixed(2)}x! Won ₨${winAmount.toFixed(2)}!`);
  };

  // Start game loop on mount
  useEffect(() => {
    startRound();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      sound.stopFlyingSound();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0e0e1a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#111122]">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-white/70">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h1 className="text-lg font-black text-red-500 tracking-wide">AVIATOR</h1>
        <WalletDisplay />
      </div>

      {/* History */}
      <AviatorHistory history={history} />

      {/* Round info */}
      <div className="flex items-center justify-between px-4 py-1.5 text-[11px] text-white/40 font-mono">
        <span>Round ID: {roundId}</span>
        <span>
          {gamePhase === "waiting" && "⏳ WAITING"}
          {gamePhase === "flying" && "🟢 LIVE"}
          {gamePhase === "crashed" && "🔴 CRASHED"}
        </span>
      </div>

      {/* Graph */}
      <div className="px-3">
        <AviatorGraph
          multiplier={multiplier}
          isFlying={isFlying}
          crashed={crashed}
          hasCashedOut={hasCashedOut1 && hasCashedOut2}
        />
      </div>

      {/* Dual Bet Panels */}
      <div className="flex gap-2 p-3">
        <AviatorBetPanel
          betAmount={betAmount1}
          onBetChange={setBetAmount1}
          onBet={placeBet1}
          onCashOut={cashOut1}
          isFlying={isFlying}
          hasCashedOut={hasCashedOut1}
          betPlaced={betPlaced1}
          multiplier={multiplier}
          panelLabel="Bet 1"
        />
        <AviatorBetPanel
          betAmount={betAmount2}
          onBetChange={setBetAmount2}
          onBet={placeBet2}
          onCashOut={cashOut2}
          isFlying={isFlying}
          hasCashedOut={hasCashedOut2}
          betPlaced={betPlaced2}
          multiplier={multiplier}
          panelLabel="Bet 2"
        />
      </div>
    </div>
  );
};

export default Aviator;
