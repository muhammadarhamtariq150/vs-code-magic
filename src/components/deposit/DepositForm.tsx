import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Copy, Loader2, AlertCircle } from "lucide-react";
import type { DepositMethod } from "./DepositDialog";

interface PaymentSetting {
  id: string;
  method: DepositMethod;
  account_name: string;
  account_number: string;
  bank_name: string | null;
  ifsc_code: string | null;
  wallet_address: string | null;
  network: string | null;
  additional_info: string | null;
}

interface DepositFormProps {
  method: DepositMethod;
  methodData: {
    id: DepositMethod;
    name: string;
    accountLabel: string;
    accountPlaceholder: string;
    color: string;
    showBankDetails?: boolean;
    ownerName?: string;
    bankAccount?: string;
    ifscCode?: string;
  };
  onSuccess: () => void;
}

type Step = "loading" | "amount" | "payment" | "confirm" | "success" | "unavailable";

const DepositForm = ({ method, methodData, onSuccess }: DepositFormProps) => {
  const [step, setStep] = useState<Step>("loading");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSetting, setPaymentSetting] = useState<PaymentSetting | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPaymentSetting();
  }, [method]);

  const fetchPaymentSetting = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .eq("method", method)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setPaymentSetting(null);
        setStep("unavailable");
        return;
      }

      setPaymentSetting(data);
      setStep("amount");
    } catch {
      setPaymentSetting(null);
      setStep("unavailable");
    }
  };

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

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (step === "unavailable") {
    return (
      <div className="flex flex-col items-center py-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Payment Method Unavailable</h3>
        <p className="text-sm text-muted-foreground text-center">
          {methodData.name} is currently not available. Please try another payment method.
        </p>
        <Button onClick={onSuccess} variant="outline" className="w-full mt-2">
          Go Back
        </Button>
      </div>
    );
  }

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

  if (step === "payment" && paymentSetting) {
    const isCrypto = ["usdt", "binance"].includes(method);
    const displayAccount = isCrypto && paymentSetting.wallet_address
      ? paymentSetting.wallet_address
      : paymentSetting.account_number;

    return (
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
          <p className="text-sm text-muted-foreground">Send {amount} to:</p>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Account Name:</span>
            <span className="text-sm font-medium text-foreground">{paymentSetting.account_name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background p-2 rounded text-sm font-mono break-all">
              {displayAccount}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(displayAccount)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          {!isCrypto && paymentSetting.bank_name && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Bank Name:</span>
              <span className="text-sm font-medium text-foreground">{paymentSetting.bank_name}</span>
            </div>
          )}

          {!isCrypto && paymentSetting.ifsc_code && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">IFSC Code:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-foreground">{paymentSetting.ifsc_code}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(paymentSetting.ifsc_code!)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {isCrypto && paymentSetting.network && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Network:</span>
              <span className="text-sm font-medium text-foreground">{paymentSetting.network}</span>
            </div>
          )}

          {paymentSetting.additional_info && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{paymentSetting.additional_info}</p>
            </div>
          )}
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
