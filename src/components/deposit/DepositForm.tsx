import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Copy, Loader2 } from "lucide-react";
import type { DepositMethod } from "./DepositDialog";

interface DepositFormProps {
  method: DepositMethod;
  methodData: {
    id: DepositMethod;
    name: string;
    accountLabel: string;
    accountPlaceholder: string;
    color: string;
  };
  onSuccess: () => void;
}

// Demo receiving accounts - replace with real accounts
const receivingAccounts = {
  usdt: "TXkVrXNUHGDrGKKWJrXN9cYdNLEg5jL1cE",
  easypaisa: "0312-1234567",
  jazzcash: "0311-7654321",
};

type Step = "amount" | "payment" | "confirm" | "success";

const DepositForm = ({ method, methodData, onSuccess }: DepositFormProps) => {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
  };

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    setStep("payment");
  };

  const handlePaymentSubmit = () => {
    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID required",
        description: "Please enter your transaction ID",
        variant: "destructive",
      });
      return;
    }
    if (!senderAccount.trim()) {
      toast({
        title: "Account required",
        description: "Please enter your sending account",
        variant: "destructive",
      });
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to make a deposit",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("deposits").insert({
        user_id: user.id,
        method: method,
        amount: parseFloat(amount),
        transaction_id: transactionId.trim(),
        sender_account: senderAccount.trim(),
      });

      if (error) throw error;

      setStep("success");
    } catch (error: any) {
      toast({
        title: "Deposit failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center py-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Deposit Submitted!</h3>
        <p className="text-sm text-muted-foreground text-center">
          Your deposit of <span className="font-semibold text-foreground">{amount}</span> via{" "}
          {methodData.name} is being processed. You'll be credited once confirmed.
        </p>
        <Button onClick={onSuccess} className="w-full mt-2">
          Done
        </Button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Method</span>
            <span className="font-medium text-foreground">{methodData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium text-foreground">{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-medium text-foreground truncate max-w-[180px]">{transactionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Account</span>
            <span className="font-medium text-foreground">{senderAccount}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Please confirm the details above. Your deposit will be reviewed and credited within 24 hours.
        </p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("payment")} className="flex-1">
            Back
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Deposit"}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-secondary/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Send {amount} to:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background p-2 rounded text-sm font-mono break-all">
              {receivingAccounts[method]}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(receivingAccounts[method])}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionId">Transaction ID / Reference</Label>
          <Input
            id="transactionId"
            placeholder="Enter transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="senderAccount">{methodData.accountLabel}</Label>
          <Input
            id="senderAccount"
            placeholder={methodData.accountPlaceholder}
            value={senderAccount}
            onChange={(e) => setSenderAccount(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("amount")} className="flex-1">
            Back
          </Button>
          <Button onClick={handlePaymentSubmit} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Deposit Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          step="any"
        />
      </div>

      <Button onClick={handleAmountSubmit} className="w-full">
        Continue
      </Button>
    </div>
  );
};

export default DepositForm;
