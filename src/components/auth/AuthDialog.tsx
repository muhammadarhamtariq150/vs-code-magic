import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, EyeOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (activeTab === "register" && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (activeTab === "register") {
        // Use username as email format for simplicity
        const email = `${username.toLowerCase().replace(/\s+/g, '')}@gamewin.app`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: username.trim(),
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This username is already taken");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Account created successfully!");
        resetForm();
        onOpenChange(false);
      } else {
        // Login
        const email = `${username.toLowerCase().replace(/\s+/g, '')}@gamewin.app`;
        
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error("Invalid username or password");
          return;
        }

        toast.success("Welcome back!");
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 p-6 sm:p-8 max-w-md w-full">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("login")}
            className={`text-xl font-semibold transition-colors ${
              activeTab === "login" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
              activeTab === "register"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <input
              type="text"
              placeholder="Please enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Please enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm Password - only for register */}
          {activeTab === "register" && (
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Please enter Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg mt-6 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? "Please wait..." : activeTab === "register" ? "REGISTER" : "LOG IN"}
          </button>
        </form>

        {/* Customer Service */}
        <div className="mt-8">
          <a
            href="#"
            className="text-accent hover:underline font-medium"
          >
            Customer Service
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
