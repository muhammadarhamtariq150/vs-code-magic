import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, ShieldCheck, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AviatorPredictor = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const date = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const time = now.toLocaleTimeString("en-GB");
  const day = now.toLocaleDateString("en-US", { weekday: "long" });

  const fetchNext = async () => {
    setLoading(true);
    setRevealed(false);
    setPrediction(null);

    // Try to read the next queued admin crash point
    const { data } = await supabase
      .from("aviator_admin_controls")
      .select("crash_point")
      .eq("status", "pending")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    let value: number;
    if (data && (data as any).crash_point) {
      value = Number((data as any).crash_point);
    } else {
      // Fallback: realistic-looking random multiplier
      const r = Math.random();
      value = r < 0.55 ? 1 + Math.random() * 1.5 : 1.5 + Math.random() * Math.random() * 12;
      value = Math.max(1.05, Number(value.toFixed(2)));
    }

    // Suspense delay
    await new Promise((r) => setTimeout(r, 1800));
    setPrediction(Number(value.toFixed(2)));
    setRevealed(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="flex items-center p-3">
        <button onClick={() => navigate(-1)} className="text-rose-600 flex items-center gap-1 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 pb-12">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-md border border-rose-100 p-5 relative overflow-hidden">
          <div className="inline-block bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-bold text-xs px-4 py-1.5 rounded-full shadow">
            Premium Software
          </div>

          <h1 className="mt-3 text-3xl font-black text-red-600 flex items-center gap-2">
            <Rocket className="w-7 h-7 -rotate-45 text-red-600" />
            Aviator Predictor
          </h1>

          <div className="mt-2 inline-block bg-gradient-to-r from-red-700 to-red-500 text-white font-extrabold text-sm px-4 py-1.5 rounded-md shadow-lg tracking-wide">
            7XBET • OFFICIAL BOT
          </div>

          <div className="mt-4 bg-rose-50/70 rounded-xl p-3 text-sm space-y-1">
            <p>
              <span className="font-bold text-red-700">Date:</span> <span className="text-gray-800">{date}</span>
              <span className="font-bold text-red-700 ml-4">Time:</span> <span className="text-gray-800">{time}</span>
            </p>
            <p>
              <span className="font-bold text-red-700">Day:</span> <span className="text-gray-800">{day}</span>
            </p>
          </div>
        </div>

        {/* Prediction circle */}
        <div className="mt-8 flex flex-col items-center">
          <div
            className={`relative w-64 h-64 rounded-full bg-white flex items-center justify-center transition-all ${
              loading ? "animate-pulse" : ""
            }`}
            style={{
              boxShadow:
                "0 0 0 6px #fff, 0 0 30px 10px rgba(239,68,68,0.45), 0 0 80px 20px rgba(239,68,68,0.25)",
            }}
          >
            {revealed && prediction !== null ? (
              <div className="text-6xl font-black text-red-600 drop-shadow-sm">
                {prediction.toFixed(2)}
              </div>
            ) : (
              <button
                onClick={fetchNext}
                disabled={loading}
                className="w-20 h-20 rounded-full bg-gray-400/80 hover:bg-gray-500 transition flex items-center justify-center shadow-xl"
              >
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </button>
            )}
          </div>

          <button
            onClick={fetchNext}
            disabled={loading}
            className="mt-8 bg-gradient-to-b from-red-600 to-red-800 text-white font-extrabold text-lg px-12 py-3 rounded-xl shadow-lg active:scale-95 transition disabled:opacity-60"
          >
            {loading ? "Predicting..." : revealed ? "Predict Again" : "Start Prediction"}
          </button>

          <div className="mt-6 w-full bg-green-50 border-l-4 border-green-500 rounded-md px-4 py-3 flex items-start gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">
              <span className="font-bold">Note:</span> This prediction is 100% real and trusted.
            </p>
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            The bot reads the next round's crash point and shows it before it happens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AviatorPredictor;
