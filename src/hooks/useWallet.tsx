import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useWallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setBalance(data?.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", user.id);

      if (error) throw error;
      setBalance(newBalance);
      return true;
    } catch (error) {
      console.error("Error updating balance:", error);
      return false;
    }
  };

  const recordTransaction = async (
    gameName: string,
    betAmount: number,
    winAmount: number,
    result: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("game_transactions").insert({
        user_id: user.id,
        game_name: gameName,
        bet_amount: betAmount,
        win_amount: winAmount,
        result: result,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error recording transaction:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  // Subscribe to realtime balance changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("wallet-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setBalance(payload.new.balance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    balance,
    loading,
    updateBalance,
    recordTransaction,
    refreshBalance: fetchBalance,
  };
};
