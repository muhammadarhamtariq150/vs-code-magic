import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, ArrowLeft, Landmark } from "lucide-react";
import WithdrawalForm from "./WithdrawalForm";

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type WithdrawalMethod = "bank" | "binance" | "upi";

interface WithdrawalMethodConfig {
  id: WithdrawalMethod;
  name: string;
  description: string;
  icon: typeof Wallet;
  color: string;
  fields: {
    name: string;
    key: string;
    placeholder: string;
    required: boolean;
  }[];
}

const withdrawalMethods: WithdrawalMethodConfig[] = [
  {
    id: "bank",
    name: "Bank Transfer",
    description: "Withdraw to bank account",
    icon: Landmark,
    color: "from-blue-500 to-blue-700",
    fields: [
      { name: "Account Holder Name", key: "account_holder", placeholder: "Enter account holder name", required: true },
      { name: "Bank Name", key: "bank_name", placeholder: "Enter bank name", required: true },
      { name: "Account Number", key: "account_number", placeholder: "Enter account number", required: true },
      { name: "IFSC Code", key: "ifsc_code", placeholder: "Enter IFSC code", required: true },
    ],
  },
  {
    id: "binance",
    name: "Binance Pay",
    description: "Withdraw via Binance",
    icon: Wallet,
    color: "from-yellow-500 to-orange-500",
    fields: [
      { name: "Binance Pay ID / Email", key: "binance_id", placeholder: "Enter your Binance Pay ID or email", required: true },
    ],
  },
  {
    id: "upi",
    name: "UPI",
    description: "Withdraw via UPI",
    icon: CreditCard,
    color: "from-purple-500 to-purple-700",
    fields: [
      { name: "UPI ID", key: "upi_id", placeholder: "yourname@upi", required: true },
      { name: "Account Holder Name", key: "account_holder", placeholder: "Enter your name", required: true },
    ],
  },
];

const WithdrawalDialog = ({ open, onOpenChange }: WithdrawalDialogProps) => {
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);

  const handleBack = () => {
    setSelectedMethod(null);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    onOpenChange(false);
  };

  const selectedMethodData = withdrawalMethods.find((m) => m.id === selectedMethod);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            {selectedMethod && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-4"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {selectedMethod ? selectedMethodData?.name : "Withdraw Funds"}
          </DialogTitle>
        </DialogHeader>

        {!selectedMethod ? (
          <div className="flex flex-col gap-3 mt-4">
            {withdrawalMethods.map((method) => (
              <Button
                key={method.id}
                variant="outline"
                className="w-full h-auto py-4 px-4 flex items-center gap-4 justify-start hover:bg-secondary/50 border-border/50 transition-all"
                onClick={() => setSelectedMethod(method.id)}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0`}
                >
                  <method.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">{method.name}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <WithdrawalForm
            method={selectedMethod}
            methodData={selectedMethodData!}
            onSuccess={handleClose}
            onBack={handleBack}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;
