import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, ShieldCheck, Rocket, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AviatorPredictor = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const cacheRef = useRef<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const date = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const time = now.toLocaleTimeString("en-GB");
  const day = now.toLocaleDateString("en-US", { weekday: "long" });

  const refreshCache = useCallback(async () => {
    const { data } = await supabase
      .from("aviator_admin_controls")
      .select("crash_point")
      .eq("status", "pending")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    cacheRef.current = data && (data as any).crash_point
      ? Number(Number((data as any).crash_point).toFixed(2))
      : null;
    return cacheRef.current;
  }, []);

  // Prefetch immediately on mount + keep refreshed every 4s
  useEffect(() => {
    refreshCache();
    const i = setInterval(refreshCache, 4000);
    return () => clearInterval(i);
  }, [refreshCache]);

  // Realtime: refresh cache instantly when admin queue changes
  useEffect(() => {
    const ch = supabase
      .channel("aviator-predictor-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "aviator_admin_controls" },
        () => refreshCache()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [refreshCache]);

  const fetchNext = async () => {
    setRevealed(false);
    setPrediction(null);

    // Instant path: cached value
    if (cacheRef.current !== null) {
      setPrediction(cacheRef.current);
      setRevealed(true);
      setAnimKey((k) => k + 1);
      // refresh in background (non-blocking)
      refreshCache();
      return;
    }

    // No cache yet — show skeleton, fetch, reveal
    setLoading(true);
    const value = await refreshCache();
    setPrediction(value);
    setRevealed(true);
    setAnimKey((k) => k + 1);
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
        <div className="bg-white rounded-2xl shadow-md border border-rose-100 p-5 relative overflow-hidden animate-fade-in">
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
            className="relative w-64 h-64 rounded-full bg-white flex items-center justify-center transition-all duration-300"
            style={{
              boxShadow:
                "0 0 0 6px #fff, 0 0 30px 10px rgba(239,68,68,0.45), 0 0 80px 20px rgba(239,68,68,0.25)",
            }}
          >
            {/* Spinning scan ring while loading */}
            {loading && (
              <span
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 border-r-red-400 animate-spin"
                style={{ animationDuration: "0.9s" }}
              />
            )}

            {revealed && prediction !== null ? (
              <div
                key={animKey}
                className="text-6xl font-black text-red-600 drop-shadow-sm animate-scale-in"
              >
                {prediction.toFixed(2)}
              </div>
            ) : revealed && prediction === null ? (
              <div className="text-center px-4 animate-fade-in">
                <div className="text-2xl font-black text-gray-400">--</div>
                <div className="text-xs text-gray-500 mt-1">No prediction available</div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center gap-2 animate-fade-in">
                {/* Skeleton shimmer block */}
                <div className="h-12 w-32 rounded-md bg-gradient-to-r from-rose-100 via-rose-200 to-rose-100 bg-[length:200%_100%] animate-[shimmer_1.2s_ease-in-out_infinite]" />
                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning round…
                </div>
              </div>
            ) : (
              <button
                onClick={fetchNext}
                className="w-20 h-20 rounded-full bg-gray-400/80 hover:bg-gray-500 transition flex items-center justify-center shadow-xl hover:scale-105 active:scale-95"
              >
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </button>
            )}
          </div>

          <button
            onClick={fetchNext}
            disabled={loading}
            className="mt-8 bg-gradient-to-b from-red-600 to-red-800 text-white font-extrabold text-lg px-12 py-3 rounded-xl shadow-lg active:scale-95 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Predicting..." : revealed ? "Predict Again" : "Start Prediction"}
          </button>

          <div className="mt-6 w-full bg-green-50 border-l-4 border-green-500 rounded-md px-4 py-3 flex items-start gap-2 animate-fade-in">
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

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default AviatorPredictor;
