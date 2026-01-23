import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, EyeOff, X, Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "form" | "verify" | "forgot" | "reset-sent";

// Generate a 6-digit OTP code
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("register");
  const [step, setStep] = useState<Step>("form");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Store the generated OTP for verification
  const generatedOTPRef = useRef<string>("");

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtpCode("");
    setStep("form");
    generatedOTPRef.current = "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "login") {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email first");
          // Send new OTP for verification
          await sendCustomOTP();
          setStep("verify");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Welcome back!");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Send custom OTP via our edge function
  const sendCustomOTP = async () => {
    const otp = generateOTP();
    generatedOTPRef.current = otp;

    console.log("Sending OTP:", otp, "to:", email.trim().toLowerCase());

    try {
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: email.trim().toLowerCase(),
          username: username.trim() || email.split('@')[0],
          otp_code: otp,
        },
      });

      if (error) {
        console.error("Error sending OTP email:", error);
        throw new Error(error.message || "Failed to send verification email");
      }

      console.log("OTP email sent successfully:", data);
      return true;
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      throw error;
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // First, send the custom OTP email
      await sendCustomOTP();
      
      toast.success("Verification code sent to your email!");
      setStep("verify");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!email.trim()) return;

    setResendLoading(true);
    try {
      await sendCustomOTP();
      toast.success("Verification code resent! Check your email.");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      // Verify the OTP code matches what we generated
      if (otpCode !== generatedOTPRef.current) {
        toast.error("Invalid verification code");
        setLoading(false);
        return;
      }

      // OTP verified, now create the actual Supabase account
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username.trim(),
            email_verified: true,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          // User exists, try to sign them in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (signInError) {
            toast.error("This email is already registered. Please login instead.");
            setActiveTab("login");
            setStep("form");
            setOtpCode("");
            return;
          }
        } else {
          toast.error(signUpError.message);
          return;
        }
      }

      toast.success("Email verified! Account created successfully!");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/`,
        }
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      setStep("reset-sent");
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("form");
    setOtpCode("");
    generatedOTPRef.current = "";
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

        {step === "verify" ? (
          /* OTP Verification Step */
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Verify your email</h2>
              <p className="text-muted-foreground text-sm">
                We've sent a 6-digit code to
                <br />
                <span className="text-foreground font-medium">{email}</span>
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(value) => setOtpCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              onClick={verifyOTP}
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>

            <div className="text-center">
              <button
                onClick={resendOTP}
                disabled={resendLoading}
                className="text-primary hover:underline text-sm disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Didn't receive code? Resend"}
              </button>
            </div>
          </div>
        ) : step === "forgot" ? (
          /* Forgot Password Step */
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Reset Password</h2>
              <p className="text-muted-foreground text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="Please enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-background/50 border border-border/50 rounded-lg px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={loading || !email.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>
        ) : step === "reset-sent" ? (
          /* Reset Email Sent Step */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Check your email</h2>
              <p className="text-muted-foreground text-sm">
                We've sent a password reset link to
                <br />
                <span className="text-foreground font-medium">{email}</span>
              </p>
            </div>

            <button
              onClick={() => {
                setStep("form");
                setActiveTab("login");
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg transition-all shadow-lg shadow-primary/20"
            >
              Back to Login
            </button>

            <div className="text-center">
              <button
                onClick={handleForgotPassword}
                disabled={resendLoading}
                className="text-primary hover:underline text-sm disabled:opacity-50"
              >
                Didn't receive email? Resend
              </button>
            </div>
          </div>
        ) : (
          /* Login/Register Form */
          <>
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
              {/* Username - only for register */}
              {activeTab === "register" && (
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
              )}

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="Please enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              {/* Forgot Password - only for login */}
              {activeTab === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setStep("forgot")}
                    className="text-primary hover:underline text-sm"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

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
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-lg mt-6 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Please wait...
                  </>
                ) : activeTab === "register" ? (
                  "REGISTER"
                ) : (
                  "LOG IN"
                )}
              </button>
            </form>

            {/* Customer Service */}
            <div className="mt-8">
              <a href="#" className="text-accent hover:underline font-medium">
                Customer Service
              </a>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
