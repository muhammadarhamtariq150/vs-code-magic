import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Check, QrCode, Gift, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AgentPromoCode = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [promoCode, setPromoCode] = useState<string>("");
  const [usesCount, setUsesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromoCode = async () => {
      if (!user) return;

      try {
        // Fetch the user's referral code
        const { data, error } = await supabase
          .from("referral_codes")
          .select("code, uses_count")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching promo code:", error);
        }

        if (data) {
          setPromoCode(data.code);
          setUsesCount(data.uses_count);
        } else {
          // Fallback code if not found (shouldn't happen due to trigger)
          setPromoCode(user.id.slice(0, 6).toUpperCase());
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoCode();
  }, [user]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Promo code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Agent Promo-Code</h1>
        </div>

        {/* Promotion Code Display */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Your Promo Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-bold font-mono tracking-widest text-primary">
                  {loading ? "..." : promoCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this code with friends to earn rewards
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <Users className="w-6 h-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{usesCount}</p>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <Gift className="w-6 h-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">₨{usesCount * 50}</p>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Promotion QR Code */}
        <Card>
          <CardContent className="py-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowQR(true)}
            >
              <p className="font-medium">Promotion QR Code</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Display</span>
                <QrCode className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Info */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="py-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              Referral Benefits
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New user gets:</span>
                <span className="font-bold text-green-500">₨100 Bonus</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">You earn:</span>
                <span className="font-bold text-green-500">₨50 per referral</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              * Bonuses are credited after the new user makes their first deposit
            </p>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li>1. Share your promo code with friends</li>
              <li>2. They enter the code during registration</li>
              <li>3. After their first deposit, you both get rewards!</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Promotion QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            <div className="w-48 h-48 bg-white p-4 rounded-lg border flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono mt-4 text-primary">{promoCode}</p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              New users enter this code to get ₨100 bonus!
            </p>
          </div>
          <Button onClick={handleCopy} className="w-full gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Code"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentPromoCode;
