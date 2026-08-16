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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    // Require a valid session
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const { data: userData, error: uErr } = await admin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (uErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const action = new URL(req.url).searchParams.get("action") || body.action;

    // Claim the next round: returns round id and (only now) the crash point
    if (action === "claim") {
      let crashPoint: number | null = null;
      let controlId: string | null = null;
      let roundId: number | null = null;

      const { data: next } = await admin
        .from("aviator_admin_controls")
        .select("id, crash_point, round_id")
        .eq("status", "pending")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (next) {
        const { data: claimed } = await admin
          .from("aviator_admin_controls")
          .update({ status: "consumed", consumed_at: new Date().toISOString() })
          .eq("id", next.id)
          .eq("status", "pending")
          .select("id, crash_point, round_id")
          .maybeSingle();

        if (claimed) {
          crashPoint = Number(claimed.crash_point);
          controlId = claimed.id;
          if (claimed.round_id) {
            roundId = Number(claimed.round_id);
            await admin.rpc("advance_aviator_round_seq", { _to: roundId });
          }
        }
      }

      if (roundId === null) {
        const { data: seqId } = await admin.rpc("next_aviator_round_id");
        if (seqId != null) roundId = Number(seqId);
      }

      return json({ round_id: roundId, crash_point: crashPoint, control_id: controlId });
    }

    // Record the actual crash for verification
    if (action === "record") {
      const controlId = String(body.control_id || "");
      const actualCrash = Number(body.actual_crash);
      if (!controlId || !Number.isFinite(actualCrash) || actualCrash <= 0) {
        return json({ error: "Invalid payload" }, 400);
      }
      await admin
        .from("aviator_admin_controls")
        .update({ actual_crash: actualCrash })
        .eq("id", controlId)
        .eq("status", "consumed")
        .is("actual_crash", null);
      return json({ success: true });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (e) {
    console.error("aviator-round error:", e);
    return json({ error: "Server error" }, 500);
  }
});
