import { useState } from "react";
import { Menu, Spade, LogOut, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/auth/AuthDialog";
import DepositDialog from "@/components/deposit/DepositDialog";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const { user, signOut } = useAuth();

  const username = user?.user_metadata?.username || "Player";

  return (
    <>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border/30 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-teal-700 flex items-center justify-center">
              <span className="text-xl font-bold">🎰</span>
            </div>
            <span className="text-xl font-bold hidden sm:block">GameWin</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <Button className="btn-primary flex items-center gap-2">
            <Spade className="w-4 h-4" />
            <span>Gaming</span>
          </Button>
        </div>
        
        {user ? (
          <div className="flex items-center gap-3">
            <Button 
              className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-primary-foreground font-semibold flex items-center gap-2"
              onClick={() => setDepositOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>DEPOSIT</span>
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
              <User className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">{username}</span>
            </div>
            <Button 
              className="btn-outline-light flex items-center gap-2" 
              onClick={signOut}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAuthOpen(true)}
              className="text-foreground/80 hover:text-foreground font-medium transition-colors"
            >
              Log in
            </button>
            <Button className="btn-outline-light" onClick={() => setAuthOpen(true)}>
              REGISTER
            </Button>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
