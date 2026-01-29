import { useState } from "react";
import { Copy, Share2, Users, Gift, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const PromoPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate referral link based on user ID
  const referralCode = user?.id?.slice(0, 8).toUpperCase() || "XXXXXXXX";
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join 7xBet",
          text: "Join 7xBet and get bonus on your first deposit!",
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <Gift className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold">Refer & Earn</h1>
          <p className="text-muted-foreground mt-2">
            Invite friends and earn bonus when they deposit!
          </p>
        </div>

        {/* Referral Link Card */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Your Referral Link</CardTitle>
            <CardDescription>Share this link with friends to earn rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-foreground outline-none truncate"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={handleShare}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-teal-600"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <span className="text-3xl font-bold tracking-wider text-primary">
                {referralCode}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              How it Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Share Your Link</p>
                  <p className="text-sm text-muted-foreground">
                    Send your referral link to friends
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Friend Signs Up</p>
                  <p className="text-sm text-muted-foreground">
                    They register using your link
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Earn Rewards</p>
                  <p className="text-sm text-muted-foreground">
                    Get bonus when they make their first deposit
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!user && (
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="py-4">
              <p className="text-center text-amber-200">
                Please login to get your personal referral link
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PromoPage;
