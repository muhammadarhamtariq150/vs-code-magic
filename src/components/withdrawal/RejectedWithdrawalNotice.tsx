import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const SUPPORT_EMAIL = "lawVservices@proton.me";

interface RejectedWithdrawal {
  id: string;
  amount: number;
  rejection_reason: string | null;
  created_at: string;
}

const RejectedWithdrawalNotice = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [withdrawal, setWithdrawal] = useState<RejectedWithdrawal | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    if (!user || !pathname.startsWith("/games/")) {
      setOpen(false);
      return () => {
        active = false;
      };
    }

    const loadRejectedWithdrawal = async () => {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("id, amount, rejection_reason, created_at")
        .eq("user_id", user.id)
        .eq("status", "rejected")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Failed to check rejected withdrawal:", error);
        return;
      }

      if (data) {
        setWithdrawal({ ...data, amount: Number(data.amount) });
        setOpen(true);
      } else {
        setWithdrawal(null);
        setOpen(false);
      }
    };

    loadRejectedWithdrawal();

    return () => {
      active = false;
    };
  }, [pathname, user]);

  if (!withdrawal || !pathname.startsWith("/games/")) return null;

  const emailSubject = encodeURIComponent("Rejected withdrawal support");
  const emailBody = encodeURIComponent(
    `Hello, I need more information about my rejected withdrawal of ₹${withdrawal.amount.toFixed(2)}. Request ID: ${withdrawal.id}`,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm border-destructive/40 bg-card">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <DialogTitle>Withdrawal Rejected</DialogTitle>
          <DialogDescription className="text-center leading-6">
            Your withdrawal of <strong className="text-foreground">₹{withdrawal.amount.toFixed(2)}</strong> was rejected.
            Please email us at <strong className="break-all text-foreground">{SUPPORT_EMAIL}</strong> for further details.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Requested</span>
            <span className="text-right font-medium">
              {new Date(withdrawal.created_at).toLocaleDateString()}
            </span>
          </div>
          {withdrawal.rejection_reason && (
            <div className="mt-2 border-t border-border pt-2">
              <span className="text-muted-foreground">Reason: </span>
              <span className="font-medium">{withdrawal.rejection_reason}</span>
            </div>
          )}
        </div>

        <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button asChild>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=${emailSubject}&body=${emailBody}`}>
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectedWithdrawalNotice;