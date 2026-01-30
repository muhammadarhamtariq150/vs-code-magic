import { useEffect, useState, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Function to log user IP when they sign in
const logUserIP = async (session: Session | null) => {
  if (!session?.access_token) return;
  
  try {
    await supabase.functions.invoke('log-ip', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  } catch (error) {
    console.error("Failed to log IP:", error);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoggedIP = useRef(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Log IP on sign in events
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && !hasLoggedIP.current) {
          hasLoggedIP.current = true;
          // Defer to avoid blocking the auth flow
          setTimeout(() => logUserIP(session), 0);
        }
        
        if (event === 'SIGNED_OUT') {
          hasLoggedIP.current = false;
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    hasLoggedIP.current = false;
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
};
