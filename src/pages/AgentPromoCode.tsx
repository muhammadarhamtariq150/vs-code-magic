import { useState } from "react";
import { ArrowLeft, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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

  // Generate referral code based on user ID
  const referralCode = user?.id?.slice(0, 8).toLowerCase() || "xxxxxxxx";
  const referralLink = `${window.location.origin}?invite=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Promotion code copied to clipboard",
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

        {/* Promotion Code */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium mb-1">Promotion code</p>
                <p className="text-sm text-muted-foreground truncate">
                  {referralLink}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="shrink-0 ml-2"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* Referral Info */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              Share this code with others. When they register using your link,
              they become your downline member and you can track their activity
              in Agent Management.
            </p>
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
            {/* Simple QR placeholder - in production you'd use a QR library */}
            <div className="w-48 h-48 bg-white p-4 rounded-lg border flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Scan to register with your referral code
            </p>
            <p className="text-xs text-primary font-mono mt-2">{referralCode}</p>
          </div>
          <Button onClick={handleCopy} className="w-full gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentPromoCode;
