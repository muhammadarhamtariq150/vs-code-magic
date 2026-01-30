import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Number to color mapping
const getColorForNumber = (num: number): string => {
  if (num === 0 || num === 5) return "violet"; // 0 and 5 are violet (also count as green/red)
  if (num % 2 === 0) return "red"; // Even numbers are red
  return "green"; // Odd numbers are green
};

// Number to size mapping
const getSizeForNumber = (num: number): string => {
  return num >= 5 ? "big" : "small";
};

// Generate period ID like GWWD2601260949
const generatePeriodId = (durationType: string, date: Date): string => {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const mins = date.getMinutes().toString().padStart(2, "0");
  
  const prefix = durationType === "1min" ? "GW1D" : 
                 durationType === "2min" ? "GW2D" : 
                 durationType === "3min" ? "GW3D" : "GW5D";
  
  return `${prefix}${year}${month}${day}${hours}${mins}`;
};

// Get duration in milliseconds
const getDurationMs = (durationType: string): number => {
  switch (durationType) {
    case "1min": return 60 * 1000;
    case "2min": return 2 * 60 * 1000;
    case "3min": return 3 * 60 * 1000;
    case "5min": return 5 * 60 * 1000;
    default: return 60 * 1000;
  }
};

// Calculate payout multiplier based on bet type
const getPayoutMultiplier = (betType: string, betValue: string): number => {
  if (betType === "number") return 9; // 9x for exact number
  if (betType === "color") {
    if (betValue === "violet") return 4.5; // Violet is rare (only 0 and 5)
    return 2; // Red/Green are 2x
  }
  if (betType === "size") return 2; // Big/Small are 2x
  return 1;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Get current active round for a duration type
    if (action === "get-round") {
      const durationType = url.searchParams.get("duration") || "1min";
      
      // Check for active round
      const { data: activeRound, error: roundError } = await supabase
        .from("wingo_rounds")
        .select("*")
        .eq("duration_type", durationType)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (roundError) {
        console.error("Error fetching round:", roundError);
        throw roundError;
      }

      // If no active round or round ended, create new one
      const now = new Date();
      if (!activeRound || new Date(activeRound.end_time) <= now) {
        // Complete old round if exists
        if (activeRound) {
          await completeRound(supabase, activeRound.id, durationType);
        }
        
        // Create new round
        const newRound = await createNewRound(supabase, durationType);
        return new Response(JSON.stringify({ round: newRound }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ round: activeRound }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get recent results history
    if (action === "get-history") {
      const durationType = url.searchParams.get("duration") || "1min";
      const limit = parseInt(url.searchParams.get("limit") || "20");

      const { data: history, error } = await supabase
        .from("wingo_rounds")
        .select("*")
        .eq("duration_type", durationType)
        .eq("status", "completed")
        .order("end_time", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return new Response(JSON.stringify({ history: history || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Place a bet
    if (action === "place-bet" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Invalid user" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { roundId, betType, betValue, amount } = body;

      // Validate round is still accepting bets (at least 10 seconds before end)
      const { data: round, error: roundError } = await supabase
        .from("wingo_rounds")
        .select("*")
        .eq("id", roundId)
        .single();

      if (roundError || !round) {
        return new Response(JSON.stringify({ error: "Round not found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const timeLeft = new Date(round.end_time).getTime() - Date.now();
      if (timeLeft < 10000) {
        return new Response(JSON.stringify({ error: "Betting closed for this round" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check user balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (walletError || !wallet || wallet.balance < amount) {
        return new Response(JSON.stringify({ error: "Insufficient balance" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Deduct from wallet
      const { error: deductError } = await supabase
        .from("wallets")
        .update({ balance: wallet.balance - amount })
        .eq("user_id", user.id);

      if (deductError) throw deductError;

      // Calculate potential win
      const multiplier = getPayoutMultiplier(betType, betValue);
      const potentialWin = amount * multiplier;

      // Create bet
      const { data: bet, error: betError } = await supabase
        .from("wingo_bets")
        .insert({
          user_id: user.id,
          round_id: roundId,
          bet_type: betType,
          bet_value: betValue,
          amount,
          potential_win: potentialWin,
        })
        .select()
        .single();

      if (betError) throw betError;

      // Log transaction
      await supabase.from("game_transactions").insert({
        user_id: user.id,
        game_name: "Wingo",
        bet_amount: amount,
        result: "pending",
        win_amount: 0,
      });

      return new Response(JSON.stringify({ success: true, bet }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin: Set next result
    if (action === "set-next-result" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Invalid user" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if admin
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const body = await req.json();
      const { durationType, nextNumber } = body;

      // Delete existing control for this duration
      await supabase
        .from("wingo_admin_controls")
        .delete()
        .eq("duration_type", durationType);

      // Insert new control
      const { data: control, error: controlError } = await supabase
        .from("wingo_admin_controls")
        .insert({
          duration_type: durationType,
          next_number: nextNumber,
          set_by: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (controlError) throw controlError;

      console.log(`Admin ${user.id} set next ${durationType} result to ${nextNumber}`);

      return new Response(JSON.stringify({ success: true, control }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin: Get current controls
    if (action === "get-controls") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Invalid user" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: controls, error } = await supabase
        .from("wingo_admin_controls")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      return new Response(JSON.stringify({ controls: controls || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process round completion (called by cron or manually)
    if (action === "process-rounds") {
      const durationTypes = ["1min", "2min", "3min", "5min"];
      const results: any[] = [];

      for (const durationType of durationTypes) {
        const { data: expiredRounds } = await supabase
          .from("wingo_rounds")
          .select("*")
          .eq("duration_type", durationType)
          .eq("status", "active")
          .lt("end_time", new Date().toISOString());

        if (expiredRounds && expiredRounds.length > 0) {
          for (const round of expiredRounds) {
            await completeRound(supabase, round.id, durationType);
            results.push({ roundId: round.id, durationType, completed: true });
          }
        }

        // Ensure there's an active round
        const { data: activeRound } = await supabase
          .from("wingo_rounds")
          .select("*")
          .eq("duration_type", durationType)
          .eq("status", "active")
          .maybeSingle();

        if (!activeRound) {
          const newRound = await createNewRound(supabase, durationType);
          results.push({ roundId: newRound.id, durationType, created: true });
        }
      }

      return new Response(JSON.stringify({ processed: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Wingo game error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper: Create new round
async function createNewRound(supabase: any, durationType: string) {
  const now = new Date();
  const durationMs = getDurationMs(durationType);
  const endTime = new Date(now.getTime() + durationMs);
  const periodId = generatePeriodId(durationType, now);

  const { data: newRound, error } = await supabase
    .from("wingo_rounds")
    .insert({
      period_id: periodId,
      duration_type: durationType,
      status: "active",
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating round:", error);
    throw error;
  }

  console.log(`Created new ${durationType} round: ${periodId}`);
  return newRound;
}

// Helper: Complete a round and process bets
async function completeRound(supabase: any, roundId: string, durationType: string) {
  // Check for admin control
  const { data: control } = await supabase
    .from("wingo_admin_controls")
    .select("*")
    .eq("duration_type", durationType)
    .eq("is_active", true)
    .maybeSingle();

  let winningNumber: number;
  let isAdminControlled = false;

  if (control && control.next_number !== null) {
    winningNumber = control.next_number;
    isAdminControlled = true;
    
    // Deactivate the control after use
    await supabase
      .from("wingo_admin_controls")
      .update({ is_active: false })
      .eq("id", control.id);
    
    console.log(`Using admin-set number ${winningNumber} for ${durationType}`);
  } else {
    // Random number 0-9
    winningNumber = Math.floor(Math.random() * 10);
    console.log(`Generated random number ${winningNumber} for ${durationType}`);
  }

  const winningColor = getColorForNumber(winningNumber);
  const winningSize = getSizeForNumber(winningNumber);

  // Update round with results
  const { error: updateError } = await supabase
    .from("wingo_rounds")
    .update({
      status: "completed",
      winning_number: winningNumber,
      winning_color: winningColor,
      winning_size: winningSize,
      is_admin_controlled: isAdminControlled,
      admin_set_number: isAdminControlled ? winningNumber : null,
    })
    .eq("id", roundId);

  if (updateError) {
    console.error("Error updating round:", updateError);
    throw updateError;
  }

  // Process all bets for this round
  const { data: bets } = await supabase
    .from("wingo_bets")
    .select("*")
    .eq("round_id", roundId);

  if (bets && bets.length > 0) {
    for (const bet of bets) {
      let isWinner = false;

      if (bet.bet_type === "number") {
        isWinner = parseInt(bet.bet_value) === winningNumber;
      } else if (bet.bet_type === "color") {
        // Special case: 0 counts as violet+red, 5 counts as violet+green
        if (bet.bet_value === "violet") {
          isWinner = winningNumber === 0 || winningNumber === 5;
        } else if (bet.bet_value === "red") {
          isWinner = winningNumber % 2 === 0;
        } else if (bet.bet_value === "green") {
          isWinner = winningNumber % 2 === 1 || winningNumber === 0;
        }
      } else if (bet.bet_type === "size") {
        isWinner = bet.bet_value === winningSize;
      }

      const payout = isWinner ? bet.potential_win : 0;

      // Update bet result
      await supabase
        .from("wingo_bets")
        .update({ is_winner: isWinner, payout })
        .eq("id", bet.id);

      // If winner, add to wallet
      if (isWinner && payout > 0) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", bet.user_id)
          .single();

        if (wallet) {
          await supabase
            .from("wallets")
            .update({ balance: wallet.balance + payout })
            .eq("user_id", bet.user_id);
        }

        // Update game transaction
        await supabase
          .from("game_transactions")
          .insert({
            user_id: bet.user_id,
            game_name: "Wingo",
            bet_amount: bet.amount,
            result: "win",
            win_amount: payout,
          });
      }
    }
  }

  console.log(`Completed round ${roundId}: Number=${winningNumber}, Color=${winningColor}, Size=${winningSize}`);
}
