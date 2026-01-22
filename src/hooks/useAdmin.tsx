import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  // IMPORTANT: start in a "loading" state so AdminLayout doesn't redirect
  // before the first role check has a chance to run.
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      // Wait until auth has resolved; otherwise we may incorrectly redirect.
      if (authLoading) return;

      if (!user) {
        setIsAdmin(false);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } finally {
        setRoleLoading(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading]);

  return { isAdmin, loading: authLoading || roleLoading };
};
