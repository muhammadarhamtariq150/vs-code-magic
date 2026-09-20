import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured" }, 500);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const { data: userData, error: uErr } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (uErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Admin access required" }, 403);

    const body = await req.json().catch(() => ({}));
    const userId: string | undefined =
      typeof body.user_id === "string" && body.user_id.length > 0 ? body.user_id : undefined;

    // Gather a compact snapshot of player activity
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const profilesQ = admin
      .from("profiles")
      .select("user_id, username, is_banned, withdrawal_forbidden, created_at")
      .order("created_at", { ascending: false })
      .limit(userId ? 1 : 40);
    if (userId) profilesQ.eq("user_id", userId);

    const depositsQ = admin
      .from("deposits")
      .select("user_id, amount, method, status, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(300);
    if (userId) depositsQ.eq("user_id", userId);

    const withdrawalsQ = admin
      .from("withdrawals")
      .select("user_id, amount, method, status, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(300);
    if (userId) withdrawalsQ.eq("user_id", userId);

    const betsQ = admin
      .from("game_transactions")
      .select("user_id, game_name, bet_amount, win_amount, result, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(600);
    if (userId) betsQ.eq("user_id", userId);

    const walletsQ = admin.from("wallets").select("user_id, balance").limit(userId ? 1 : 100);
    if (userId) walletsQ.eq("user_id", userId);

    const [profiles, deposits, withdrawals, bets, wallets] = await Promise.all([
      profilesQ,
      depositsQ,
      withdrawalsQ,
      betsQ,
      walletsQ,
    ]);

    const snapshot = {
      scope: userId ? "single_player" : "all_players_last_30_days",
      players: profiles.data ?? [],
      wallets: wallets.data ?? [],
      deposits: deposits.data ?? [],
      withdrawals: withdrawals.data ?? [],
      bets: bets.data ?? [],
    };

    const prompt = `You are an analyst for an online gaming platform admin panel.
Analyse the following player data and reply in clear markdown with these sections:
1. Overview (key totals: deposits, withdrawals, bets, net position)
2. Top players (by deposits and by profit/loss)
3. Game-wise performance (which games win or lose money)
4. Risk flags (multi-accounting hints, unusual win rates, withdrawal abuse, bonus abuse)
5. Recommended admin actions (short bullet list)
Keep it under 500 words. Use the currency symbol Rs. Never invent data that is not present.

DATA (JSON):
${JSON.stringify(snapshot)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        stream: true,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (!aiRes.ok || !aiRes.body) {
      const errText = await aiRes.text().catch(() => "");
      console.error("AI gateway error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return json({ error: "AI is busy right now. Please try again in a moment." }, 429);
      }
      if (aiRes.status === 402) {
        return json({ error: "AI credits exhausted. Please top up to continue." }, 402);
      }
      return json({ error: "AI request failed" }, aiRes.status || 500);
    }

    // Consume the SSE stream server-side and return the final text
    const reader = aiRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            text += evt.delta;
          } else if (evt.type === "response.completed" && !text) {
            text = evt.response?.output_text ?? "";
          }
        } catch {
          // ignore partial/non-JSON lines
        }
      }
    }

    if (!text.trim()) {
      return json({ error: "The AI returned no analysis. Please try again." }, 502);
    }

    return json({ analysis: text });
  } catch (e) {
    console.error("analyze-players error:", e);
    return json({ error: "Server error" }, 500);
  }
});
