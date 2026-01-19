import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Smartphone, CreditCard } from "lucide-react";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const depositMethods = [
  {
    id: "usdt",
    name: "Deposit USDT",
    description: "Cryptocurrency deposit",
    icon: Wallet,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "easypaisa",
    name: "Easypaisa",
    description: "Mobile wallet transfer",
    icon: Smartphone,
    color: "from-green-400 to-green-600",
  },
  {
    id: "jazzcash",
    name: "JazzCash",
    description: "Mobile wallet transfer",
    icon: CreditCard,
    color: "from-red-500 to-red-600",
  },
];

const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const handleMethodClick = (methodId: string) => {
    // TODO: Implement deposit flow for each method
    console.log(`Selected deposit method: ${methodId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Choose Deposit Method
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          {depositMethods.map((method) => (
            <Button
              key={method.id}
              variant="outline"
              className="w-full h-auto py-4 px-4 flex items-center gap-4 justify-start hover:bg-secondary/50 border-border/50 transition-all"
              onClick={() => handleMethodClick(method.id)}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${method.color} flex items-center justify-center shrink-0`}>
                <method.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">{method.name}</p>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
