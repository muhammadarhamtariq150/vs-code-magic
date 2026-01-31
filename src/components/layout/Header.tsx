import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Spade, LogOut, User, Plus, Shield, ArrowDownToLine, Users, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/auth/AuthDialog";
import DepositDialog from "@/components/deposit/DepositDialog";
import WithdrawalDialog from "@/components/withdrawal/WithdrawalDialog";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useSound } from "@/hooks/useSound";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { playClick, playDeposit } = useSound();
  const navigate = useNavigate();

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
      <header className="h-14 sm:h-16 bg-background/95 backdrop-blur-md border-b border-border/30 flex items-center justify-between px-3 sm:px-4 sticky top-0 z-50">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2" onClick={() => playClick()}>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary to-teal-700 flex items-center justify-center shadow-lg">
            <span className="text-lg sm:text-xl">🎰</span>
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">7xBet</span>
        </Link>
        
        {user ? (
          <div className="flex items-center gap-1.5 sm:gap-3">
            {isAdmin && (
              <Link to="/admin" onClick={() => playClick()}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 sm:h-9 px-2 sm:px-3 border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1.5">Admin</span>
                </Button>
              </Link>
            )}
            <Button 
              size="sm"
              className="h-8 sm:h-9 px-2.5 sm:px-4 bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-primary-foreground font-semibold shadow-md"
              onClick={handleDepositOpen}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline ml-1">Deposit</span>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-2.5 sm:px-4 border-primary/50 text-primary hover:bg-primary/10 font-medium"
              onClick={handleWithdrawalOpen}
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">Withdraw</span>
            </Button>
            
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 sm:h-9 px-2 sm:px-3 bg-secondary/50 hover:bg-secondary gap-1.5"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-foreground font-medium text-sm max-w-[80px] truncate">{username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => { playClick(); navigate("/profile"); }}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { playClick(); navigate("/agent-management"); }}>
                  <Users className="w-4 h-4 mr-2" />
                  Agent Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { playClick(); navigate("/agent-promo-code"); }}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Agent Promo-Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleAuthOpen}
              className="h-8 sm:h-9 px-3 text-foreground/80 hover:text-foreground font-medium"
            >
              Log in
            </Button>
            <Button 
              size="sm"
              className="h-8 sm:h-9 px-3 sm:px-4 bg-gradient-to-r from-primary to-teal-600 text-primary-foreground font-semibold shadow-md" 
              onClick={handleAuthOpen}
            >
              Register
            </Button>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
