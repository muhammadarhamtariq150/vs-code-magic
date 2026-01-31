import { User, Wallet, History, LogOut, Shield, ChevronRight, UserCircle, Users, Link2, FileText, Banknote, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useAdmin } from "@/hooks/useAdmin";
import { useSound } from "@/hooks/useSound";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import DepositDialog from "@/components/deposit/DepositDialog";
import WithdrawalDialog from "@/components/withdrawal/WithdrawalDialog";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { balance, loading } = useWallet();
  const { isAdmin } = useAdmin();
  const { playClick } = useSound();
  const navigate = useNavigate();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  const username = user?.user_metadata?.username || "Player";
  const memberId = user?.id?.slice(0, 6).toUpperCase() || "000000";

  const handleSignOut = () => {
    playClick();
    signOut();
  };

  const handleNavigation = (path: string) => {
    playClick();
    navigate(path);
  };

  // Quick action buttons
  const quickActions = [
    { icon: ArrowDownToLine, label: "Withdrawal", action: () => setWithdrawalOpen(true) },
    { icon: History, label: "Financial Records", action: () => handleNavigation("/bet-records") },
  ];

  // Main menu items
  const menuItems = [
    { icon: UserCircle, label: "Personal Info", href: "/personal-info" },
    { icon: Users, label: "Agent Management", href: "/agent-management" },
    { icon: Link2, label: "Agent Promo-Code", href: "/agent-promo-code" },
    { icon: FileText, label: "Bet Records", href: "/bet-records" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24 flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardContent className="py-8 text-center">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Not Logged In</h2>
            <p className="text-muted-foreground mb-4">Please login to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-2 border-white/30">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{username}</h2>
              <button className="p-1 hover:bg-white/20 rounded">
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-white/70">ID: {memberId}</p>
          </div>
          <div className="bg-amber-500/80 px-2 py-1 rounded text-xs font-bold text-white">
            VIP 0
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <Card className="bg-card border-border/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-primary">
                  ₨ {loading ? "..." : balance?.toFixed(2) || "0.00"}
                </p>
              </div>
              <Button
                onClick={() => {
                  playClick();
                  setDepositOpen(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Deposit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center py-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => {
                  playClick();
                  action.action();
                }}
                className="flex flex-col items-center gap-2 px-6 py-3 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Admin Access */}
        {isAdmin && (
          <Link to="/admin" onClick={() => playClick()}>
            <Card className="border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 transition-colors cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <span className="font-medium text-amber-200">Admin Dashboard</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-400" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Menu Items */}
        <Card>
          <CardContent className="py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center justify-between py-4 cursor-pointer hover:bg-secondary/30 px-2 rounded-lg transition-colors ${
                    index !== menuItems.length - 1 ? "border-b border-border/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Dialogs */}
      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawalDialog open={withdrawalOpen} onOpenChange={setWithdrawalOpen} />
    </div>
  );
};

export default ProfilePage;
