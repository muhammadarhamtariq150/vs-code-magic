import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Smartphone, CreditCard, ArrowLeft } from "lucide-react";
import DepositForm from "./DepositForm";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type DepositMethod = "usdt" | "easypaisa" | "jazzcash";

const depositMethods = [
  {
    id: "usdt" as DepositMethod,
    name: "Deposit USDT",
    description: "Cryptocurrency deposit",
    icon: Wallet,
    color: "from-green-500 to-emerald-600",
    accountLabel: "TRC20 Wallet Address",
    accountPlaceholder: "Your TRC20 wallet address",
  },
  {
    id: "easypaisa" as DepositMethod,
    name: "Easypaisa",
    description: "Mobile wallet transfer",
    icon: Smartphone,
    color: "from-green-400 to-green-600",
    accountLabel: "Easypaisa Account Number",
    accountPlaceholder: "03XX-XXXXXXX",
  },
  {
    id: "jazzcash" as DepositMethod,
    name: "JazzCash",
    description: "Mobile wallet transfer",
    icon: CreditCard,
    color: "from-red-500 to-red-600",
    accountLabel: "JazzCash Account Number",
    accountPlaceholder: "03XX-XXXXXXX",
  },
];

const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);

  const handleBack = () => {
    setSelectedMethod(null);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    onOpenChange(false);
  };

  const selectedMethodData = depositMethods.find((m) => m.id === selectedMethod);

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
            {selectedMethod ? selectedMethodData?.name : "Choose Deposit Method"}
          </DialogTitle>
        </DialogHeader>

        {!selectedMethod ? (
          <div className="flex flex-col gap-3 mt-4">
            {depositMethods.map((method) => (
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
          <DepositForm
            method={selectedMethod}
            methodData={selectedMethodData!}
            onSuccess={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
