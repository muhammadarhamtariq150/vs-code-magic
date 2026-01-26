import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type { WithdrawalMethod } from "./WithdrawalDialog";

interface WithdrawalFormProps {
  method: WithdrawalMethod;
  methodData: {
    id: WithdrawalMethod;
    name: string;
    color: string;
    fields: {
      name: string;
      key: string;
      placeholder: string;
      required: boolean;
    }[];
  };
  onSuccess: () => void;
  onBack: () => void;
}

type Step = "amount" | "details" | "confirm" | "success" | "error";

const WithdrawalForm = ({ method, methodData, onSuccess, onBack }: WithdrawalFormProps) => {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [accountDetails, setAccountDetails] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const { balance, refreshBalance } = useWallet();

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
    if (numAmount > balance) {
      toast({
        title: "Insufficient balance",
        description: `Your balance is ₹${balance.toFixed(2)}. You cannot withdraw more than your available balance.`,
        variant: "destructive",
      });
      return;
    }
    if (numAmount < 100) {
      toast({
        title: "Minimum withdrawal",
        description: "Minimum withdrawal amount is ₹100",
        variant: "destructive",
      });
      return;
    }
    setStep("details");
  };

  const handleDetailsSubmit = () => {
    // Validate all required fields
    for (const field of methodData.fields) {
      if (field.required && !accountDetails[field.key]?.trim()) {
        toast({
          title: `${field.name} required`,
          description: `Please enter your ${field.name.toLowerCase()}`,
          variant: "destructive",
        });
        return;
      }
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to make a withdrawal",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);

    setIsSubmitting(true);
    try {
      // First, deduct from wallet
      const { data: wallet, error: walletFetchError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (walletFetchError) throw walletFetchError;

      if (Number(wallet.balance) < numAmount) {
        throw new Error("Insufficient balance");
      }

      // Deduct balance
      const { error: walletUpdateError } = await supabase
        .from("wallets")
        .update({ balance: Number(wallet.balance) - numAmount })
        .eq("user_id", user.id);

      if (walletUpdateError) throw walletUpdateError;

      // Create withdrawal request
      const { error: withdrawalError } = await supabase.from("withdrawals").insert({
        user_id: user.id,
        method: method,
        amount: numAmount,
        account_details: accountDetails,
        status: "pending",
      });

      if (withdrawalError) {
        // Rollback wallet deduction
        await supabase
          .from("wallets")
          .update({ balance: Number(wallet.balance) })
          .eq("user_id", user.id);
        throw withdrawalError;
      }

      await refreshBalance();
      setStep("success");
    } catch (error: any) {
      console.error("Withdrawal error:", error);
      setErrorMessage(error.message || "Something went wrong");
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "error") {
    return (
      <div className="flex flex-col items-center py-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Withdrawal Failed</h3>
        <p className="text-sm text-muted-foreground text-center">{errorMessage}</p>
        <Button onClick={onBack} variant="outline" className="w-full mt-2">
          Try Again
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
        <h3 className="text-lg font-semibold text-foreground">Withdrawal Submitted!</h3>
        <p className="text-sm text-muted-foreground text-center">
          Your withdrawal of <span className="font-semibold text-foreground">₹{amount}</span> via{" "}
          {methodData.name} has been submitted. The amount has been deducted from your wallet.
          <br /><br />
          You will receive your funds once approved by admin.
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
            <span className="font-medium text-foreground">₹{parseFloat(amount).toLocaleString()}</span>
          </div>
          {methodData.fields.map((field) => (
            <div key={field.key} className="flex justify-between">
              <span className="text-muted-foreground">{field.name}</span>
              <span className="font-medium text-foreground truncate max-w-[180px]">
                {accountDetails[field.key]}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
            ⚠️ The amount will be deducted from your wallet immediately. 
            You will receive funds after admin approval.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
            Back
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="flex-1">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Withdrawal"}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-sm text-center">
            Withdrawal Amount: <span className="font-semibold text-primary">₹{parseFloat(amount).toLocaleString()}</span>
          </p>
        </div>

        {methodData.fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.name} {field.required && <span className="text-destructive">*</span>}</Label>
            <Input
              id={field.key}
              placeholder={field.placeholder}
              value={accountDetails[field.key] || ""}
              onChange={(e) => setAccountDetails({ ...accountDetails, [field.key]: e.target.value })}
            />
          </div>
        ))}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("amount")} className="flex-1">
            Back
          </Button>
          <Button onClick={handleDetailsSubmit} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="bg-secondary/30 rounded-lg p-3">
        <p className="text-sm text-center">
          Available Balance: <span className="font-semibold text-primary">₹{balance.toFixed(2)}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Withdrawal Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount (min ₹100)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="100"
          max={balance}
          step="any"
        />
        <p className="text-xs text-muted-foreground">Minimum withdrawal: ₹100</p>
      </div>

      <Button onClick={handleAmountSubmit} className="w-full">
        Continue
      </Button>
    </div>
  );
};

export default WithdrawalForm;
