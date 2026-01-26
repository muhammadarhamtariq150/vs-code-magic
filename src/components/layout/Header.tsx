import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Spade, LogOut, User, Plus, Shield, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/auth/AuthDialog";
import DepositDialog from "@/components/deposit/DepositDialog";
import WithdrawalDialog from "@/components/withdrawal/WithdrawalDialog";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useSound } from "@/hooks/useSound";

const Header = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { playClick, playDeposit } = useSound();

  const username = user?.user_metadata?.username || "Player";

  const handleAuthOpen = () => {
    playClick();
    setAuthOpen(true);
  };

  const handleDepositOpen = () => {
    playDeposit();
    setDepositOpen(true);
  };

  const handleWithdrawalOpen = () => {
    playClick();
    setWithdrawalOpen(true);
  };

  const handleSignOut = () => {
    playClick();
    signOut();
  };

  return (
    <>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawalDialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen} />
      <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border/30 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => playClick()}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-2" onClick={() => playClick()}>
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-teal-700 flex items-center justify-center">
              <span className="text-xl font-bold">🎰</span>
            </div>
            <span className="text-xl font-bold hidden sm:block">7xBet</span>
          </Link>
        </div>
        
        <div className="flex items-center">
          <Button className="btn-primary flex items-center gap-2" onClick={() => playClick()}>
            <Spade className="w-4 h-4" />
            <span>Gaming</span>
          </Button>
        </div>
        
        {user ? (
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin" onClick={() => playClick()}>
                <Button variant="outline" className="flex items-center gap-2 border-primary/50 text-primary hover:bg-primary/10">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            <Button 
              className="bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-primary-foreground font-semibold flex items-center gap-2"
              onClick={handleDepositOpen}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">DEPOSIT</span>
            </Button>
            <Button 
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 font-semibold flex items-center gap-2"
              onClick={handleWithdrawalOpen}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span className="hidden sm:inline">WITHDRAW</span>
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
              <User className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">{username}</span>
            </div>
            <Button 
              className="btn-outline-light flex items-center gap-2" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAuthOpen}
              className="text-foreground/80 hover:text-foreground font-medium transition-colors"
            >
              Log in
            </button>
            <Button className="btn-outline-light" onClick={handleAuthOpen}>
              REGISTER
            </Button>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
