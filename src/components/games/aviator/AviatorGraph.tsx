import { memo, useRef, useEffect } from "react";

interface AviatorGraphProps {
  multiplier: number;
  isFlying: boolean;
  crashed: boolean;
  hasCashedOut: boolean;
}

const AviatorGraph = memo(({ multiplier, isFlying, crashed, hasCashedOut }: AviatorGraphProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = "rgba(100, 150, 255, 0.15)";
    const spacing = 60;
    for (let x = 30; x < W; x += spacing) {
      for (let y = 30; y < H; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, H - 30);
    ctx.lineTo(W - 10, H - 30);
    ctx.moveTo(40, H - 30);
    ctx.lineTo(40, 10);
    ctx.stroke();

    // Axis ticks
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "10px monospace";
    for (let i = 0; i <= 4; i++) {
      const x = 40 + ((W - 50) / 4) * i;
      ctx.beginPath();
      ctx.arc(x, H - 30, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (multiplier <= 1.0 && !crashed) return;

    // Calculate curve points
    const progress = Math.min((multiplier - 1) / 15, 1);
    const endX = 40 + (W - 80) * progress;
    const endY = (H - 30) - (H - 60) * Math.pow(progress, 0.6);

    // Gradient fill under curve
    const gradient = ctx.createLinearGradient(0, H, 0, 0);
    gradient.addColorStop(0, "rgba(220, 30, 60, 0.0)");
    gradient.addColorStop(0.5, "rgba(220, 30, 60, 0.08)");
    gradient.addColorStop(1, "rgba(220, 30, 60, 0.15)");

    ctx.beginPath();
    ctx.moveTo(40, H - 30);
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = 40 + (W - 80) * progress * t;
      const py = (H - 30) - (H - 60) * Math.pow(progress * t, 0.6);
      ctx.lineTo(px, py);
    }
    ctx.lineTo(endX, H - 30);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Red curve line
    ctx.beginPath();
    ctx.moveTo(40, H - 30);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = 40 + (W - 80) * progress * t;
      const py = (H - 30) - (H - 60) * Math.pow(progress * t, 0.6);
      ctx.lineTo(px, py);
    }
    ctx.strokeStyle = crashed ? "#ff2020" : "#ff3040";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ff3040";
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Plane emoji at end of curve
    if (!crashed) {
      const angle = Math.atan2(
        -((H - 60) * 0.6 * Math.pow(progress, -0.4) / 15),
        (W - 80) / 15
      );
      ctx.save();
      ctx.translate(endX, endY);
      ctx.rotate(angle);
      ctx.font = "32px serif";
      ctx.fillText("✈️", -8, 8);
      ctx.restore();
    }

    // Crash explosion
    if (crashed) {
      ctx.font = "48px serif";
      ctx.fillText("💥", endX - 24, endY + 16);
    }
  }, [multiplier, crashed, isFlying]);

  // Multiplier text
  const getMultiplierColor = () => {
    if (crashed) return "text-red-500";
    if (hasCashedOut) return "text-green-400";
    if (multiplier >= 5) return "text-yellow-300";
    return "text-white";
  };

  return (
    <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-gray-950 via-[#0a0a1a] to-gray-950 rounded-xl overflow-hidden border border-white/5">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(180,30,60,0.08)_0%,transparent_70%)]" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Multiplier overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`font-black tracking-tight ${getMultiplierColor()} ${crashed ? "animate-pulse" : ""}`}
          style={{
            fontSize: "clamp(2.5rem, 12vw, 6rem)",
            textShadow: crashed
              ? "0 0 40px rgba(255,0,0,0.6)"
              : "0 0 30px rgba(255,255,255,0.15)",
          }}
        >
          {crashed ? "FLEW AWAY!" : `${multiplier.toFixed(2)}x`}
        </div>
      </div>

      {/* Waiting state */}
      {!isFlying && !crashed && multiplier <= 1.0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white/60 animate-pulse">
              WAITING...
            </div>
            <div className="text-sm text-white/30 mt-1">Next round starting</div>
          </div>
        </div>
      )}
    </div>
  );
});

AviatorGraph.displayName = "AviatorGraph";
export default AviatorGraph;
