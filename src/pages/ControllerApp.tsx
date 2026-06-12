import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plane, LogOut, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import AviatorControlPanel from "@/components/AviatorControlPanel";

const ControllerApp = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  if (authLoading || (user && adminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-rose-900 p-4">
        <Card className="w-full max-w-sm p-6 space-y-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <Plane className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-xl font-bold">Aviator Controller</h1>
            <p className="text-xs text-muted-foreground">Admin sign-in required</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Authed but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm p-6 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-destructive mx-auto" />
          <h1 className="text-lg font-bold">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            This account is not an admin. Sign in with an admin account.
          </p>
          <Button variant="outline" className="w-full gap-2" onClick={signOut}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </Card>
      </div>
    );
  }

  // Authed admin → show controller
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-red-500" />
            <span className="font-bold">Aviator Controller</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <AviatorControlPanel />
      </main>
    </div>
  );
};

export default ControllerApp;
