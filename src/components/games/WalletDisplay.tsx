import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

const WalletDisplay = () => {
  const { balance, loading } = useWallet();

  return (
    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg px-4 py-2">
      <Wallet className="w-5 h-5 text-primary" />
      <span className="font-semibold text-foreground">
        {loading ? "..." : `₨${balance.toLocaleString()}`}
      </span>
    </div>
  );
};

export default WalletDisplay;
