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

    // Draw the distinctive red, outlined Aviator jet from the reference.
    if (!crashed) {
      const prevProgress = Math.max(0, progress - 0.02);
      const prevX = 40 + (W - 80) * prevProgress;
      const prevY = (H - 30) - (H - 60) * Math.pow(prevProgress, 0.6);
      const angle = Math.atan2(prevY - endY, endX - prevX);

      ctx.save();
      ctx.translate(endX, endY);
      ctx.rotate(-angle);

      const s = Math.min(W, H) * 0.1;
      const red = "#ff1717";
      const dark = "#0a0a12";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Three sharp speed streaks behind the aircraft.
      ctx.strokeStyle = red;
      ctx.lineWidth = Math.max(2, s * 0.09);
      [[-2.25, -0.32, -1.22, -0.3], [-2.5, 0, -1.35, -0.03], [-2.18, 0.31, -1.05, 0.17]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(s * x1, s * y1);
        ctx.lineTo(s * x2, s * y2);
        ctx.stroke();
      });

      // Solid side-profile silhouette: swept wings, raised tail and pointed nose.
      ctx.fillStyle = red;
      ctx.strokeStyle = red;
      ctx.lineWidth = Math.max(1.5, s * 0.06);
      ctx.beginPath();
      ctx.moveTo(-1.45 * s, -0.16 * s);
      ctx.lineTo(-1.82 * s, -0.62 * s);
      ctx.lineTo(-1.62 * s, -0.7 * s);
      ctx.lineTo(-1.05 * s, -0.34 * s);
      ctx.lineTo(-0.2 * s, -0.49 * s);
      ctx.lineTo(0.18 * s, -0.39 * s);
      ctx.lineTo(0.62 * s, -0.3 * s);
      ctx.lineTo(1.34 * s, -0.08 * s);
      ctx.quadraticCurveTo(1.62 * s, 0, 1.34 * s, 0.13 * s);
      ctx.lineTo(0.45 * s, 0.34 * s);
      ctx.lineTo(-0.55 * s, 0.5 * s);
      ctx.lineTo(-1.42 * s, 0.63 * s);
      ctx.lineTo(-1.72 * s, 0.5 * s);
      ctx.lineTo(-1.33 * s, 0.22 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tall swept wing, matching the reference plane's recognizable profile.
      ctx.beginPath();
      ctx.moveTo(0.48 * s, -0.28 * s);
      ctx.lineTo(0.75 * s, -1.18 * s);
      ctx.lineTo(0.92 * s, -1.12 * s);
      ctx.lineTo(0.94 * s, -0.14 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lower wing and nose fin.
      ctx.beginPath();
      ctx.moveTo(0.2 * s, 0.28 * s);
      ctx.lineTo(0.66 * s, 0.88 * s);
      ctx.lineTo(0.83 * s, 0.82 * s);
      ctx.lineTo(0.72 * s, 0.17 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Black cockpit and cutout marks give the same illustrated logo treatment.
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(0.1 * s, -0.29 * s);
      ctx.lineTo(0.58 * s, -0.19 * s);
      ctx.lineTo(0.43 * s, -0.02 * s);
      ctx.lineTo(0.03 * s, -0.13 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = dark;
      ctx.lineWidth = Math.max(1.5, s * 0.065);
      ctx.beginPath();
      ctx.moveTo(-0.72 * s, -0.2 * s);
      ctx.lineTo(-0.32 * s, -0.31 * s);
      ctx.moveTo(-0.98 * s, 0.16 * s);
      ctx.lineTo(-0.48 * s, 0.08 * s);
      ctx.moveTo(0.42 * s, -0.02 * s);
      ctx.lineTo(0.55 * s, 0.21 * s);
      ctx.stroke();

      ctx.restore();
    }

    // Crash explosion with particles
    if (crashed) {
      // Shockwave ring
      ctx.strokeStyle = "rgba(255, 100, 0, 0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(endX, endY, 40, 0, Math.PI * 2);
      ctx.stroke();

      // Explosion core
      const explGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, 30);
      explGrad.addColorStop(0, "rgba(255, 255, 200, 0.9)");
      explGrad.addColorStop(0.3, "rgba(255, 150, 0, 0.7)");
      explGrad.addColorStop(0.7, "rgba(255, 50, 0, 0.3)");
      explGrad.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = explGrad;
      ctx.beginPath();
      ctx.arc(endX, endY, 30, 0, Math.PI * 2);
      ctx.fill();

      // Debris particles
      ctx.fillStyle = "#ff4400";
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 / 8) * i + 0.3;
        const r = 18 + Math.random() * 15;
        ctx.beginPath();
        ctx.arc(endX + Math.cos(a) * r, endY + Math.sin(a) * r, 2 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
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
