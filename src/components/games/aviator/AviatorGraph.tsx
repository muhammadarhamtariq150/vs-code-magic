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

    // Draw professional airplane at curve tip
    if (!crashed) {
      const prevProgress = Math.max(0, progress - 0.02);
      const prevX = 40 + (W - 80) * prevProgress;
      const prevY = (H - 30) - (H - 60) * Math.pow(prevProgress, 0.6);
      const angle = Math.atan2(prevY - endY, endX - prevX);

      ctx.save();
      ctx.translate(endX, endY);
      ctx.rotate(-angle);

      const s = Math.min(W, H) * 0.07; // plane scale

      // Engine glow
      ctx.shadowColor = "#ff4444";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "rgba(255, 80, 30, 0.6)";
      ctx.beginPath();
      ctx.ellipse(-s * 1.2, 0, s * 0.6, s * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Trail flames
      ctx.fillStyle = "rgba(255, 120, 30, 0.4)";
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, 0);
      ctx.lineTo(-s * 2.2, s * 0.15);
      ctx.lineTo(-s * 1.8, 0);
      ctx.lineTo(-s * 2.2, -s * 0.15);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255, 200, 50, 0.3)";
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, 0);
      ctx.lineTo(-s * 2.8, s * 0.08);
      ctx.lineTo(-s * 2.4, 0);
      ctx.lineTo(-s * 2.8, -s * 0.08);
      ctx.closePath();
      ctx.fill();

      // Fuselage (main body)
      ctx.fillStyle = "#dc2626";
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s * 1.1, 0);
      ctx.quadraticCurveTo(s * 0.9, -s * 0.18, s * 0.3, -s * 0.15);
      ctx.lineTo(-s * 0.7, -s * 0.12);
      ctx.quadraticCurveTo(-s * 0.9, 0, -s * 0.7, s * 0.12);
      ctx.lineTo(s * 0.3, s * 0.15);
      ctx.quadraticCurveTo(s * 0.9, s * 0.18, s * 1.1, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fuselage highlight
      ctx.fillStyle = "rgba(255, 100, 100, 0.4)";
      ctx.beginPath();
      ctx.moveTo(s * 0.9, -s * 0.05);
      ctx.quadraticCurveTo(s * 0.5, -s * 0.14, -s * 0.3, -s * 0.1);
      ctx.lineTo(-s * 0.3, -s * 0.02);
      ctx.quadraticCurveTo(s * 0.4, -s * 0.02, s * 0.9, -s * 0.05);
      ctx.fill();

      // Main wings
      ctx.fillStyle = "#b91c1c";
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(s * 0.15, -s * 0.12);
      ctx.lineTo(-s * 0.1, -s * 0.65);
      ctx.lineTo(-s * 0.4, -s * 0.6);
      ctx.lineTo(-s * 0.25, -s * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(s * 0.15, s * 0.12);
      ctx.lineTo(-s * 0.1, s * 0.65);
      ctx.lineTo(-s * 0.4, s * 0.6);
      ctx.lineTo(-s * 0.25, s * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tail fin
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(-s * 0.55, -s * 0.1);
      ctx.lineTo(-s * 0.75, -s * 0.45);
      ctx.lineTo(-s * 0.9, -s * 0.4);
      ctx.lineTo(-s * 0.75, -s * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tail horizontal stabilizers
      ctx.fillStyle = "#b91c1c";
      ctx.beginPath();
      ctx.moveTo(-s * 0.6, -s * 0.08);
      ctx.lineTo(-s * 0.7, -s * 0.3);
      ctx.lineTo(-s * 0.85, -s * 0.25);
      ctx.lineTo(-s * 0.7, -s * 0.08);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-s * 0.6, s * 0.08);
      ctx.lineTo(-s * 0.7, s * 0.3);
      ctx.lineTo(-s * 0.85, s * 0.25);
      ctx.lineTo(-s * 0.7, s * 0.08);
      ctx.closePath();
      ctx.fill();

      // Cockpit window
      ctx.fillStyle = "rgba(150, 220, 255, 0.7)";
      ctx.beginPath();
      ctx.ellipse(s * 0.7, -s * 0.03, s * 0.12, s * 0.06, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // Propeller disc (spinning effect)
      ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(s * 1.1, 0, s * 0.03, s * 0.2, 0, 0, Math.PI * 2);
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
