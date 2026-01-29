import { Home, Gift, Plus, User } from "lucide-react";
import { useSound } from "@/hooks/useSound";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onDepositOpen: () => void;
}

const BottomNav = ({ activeTab, onTabChange, onDepositOpen }: BottomNavProps) => {
  const { playClick, playDeposit } = useSound();

  const handleTabClick = (tab: string) => {
    playClick();
    if (tab === "deposit") {
      playDeposit();
      onDepositOpen();
    } else {
      onTabChange(tab);
    }
  };

  const navItems = [
    { id: "lobby", icon: Home, label: "Lobby" },
    { id: "promo", icon: Gift, label: "Promo" },
    { id: "deposit", icon: Plus, label: "Deposit" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isDeposit = item.id === "deposit";

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isDeposit
                  ? "text-primary"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isDeposit ? (
                <div className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-r from-primary to-teal-600 flex items-center justify-center shadow-lg shadow-primary/30">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <Icon className={`w-6 h-6 ${isActive ? "text-primary" : ""}`} />
              )}
              <span className={`text-xs mt-1 font-medium ${isDeposit ? "mt-2" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
