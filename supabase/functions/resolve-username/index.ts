import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Basic per-IP rate limit so the endpoint cannot be used to enumerate accounts
const buckets = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQ = 10;
const isRateLimited = (key: string) => {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_REQ) {
    buckets.set(key, arr);
    return true;
  }
  arr.push(now);
  buckets.set(key, arr);
  return false;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || "unknown";
    if (isRateLimited(`ip:${ip}`)) {
      return json({ error: "Too many requests" }, 429);
    }

    const { username, password } = await req.json();
    const cleaned = typeof username === "string" ? username.trim() : "";

    if (!/^[A-Za-z0-9_.-]{3,40}$/.test(cleaned) || typeof password !== "string" || !password) {
      return json({ error: "Invalid username or password" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: profile } = await admin
      .from("profiles")
      .select("user_id")
      .ilike("username", cleaned)
      .maybeSingle();

    if (!profile) {
      return json({ error: "Invalid username or password" }, 401);
    }

    const { data: userData } = await admin.auth.admin.getUserById(profile.user_id);
    const email = userData?.user?.email;
    if (!email) {
      return json({ error: "Invalid username or password" }, 401);
    }

    // Sign in server-side so the account's email is never disclosed to the client
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: signIn, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signIn.session) {
      return json({ error: "Invalid username or password" }, 401);
    }

    return json({
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    });
  } catch (e) {
    console.error("resolve-username error:", e);
    return json({ error: "Server error" }, 500);
  }
});
