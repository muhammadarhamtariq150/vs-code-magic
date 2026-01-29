import { User, Wallet, History, Settings, LogOut, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useAdmin } from "@/hooks/useAdmin";
import { useSound } from "@/hooks/useSound";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { balance, loading } = useWallet();
  const { isAdmin } = useAdmin();
  const { playClick } = useSound();

  const username = user?.user_metadata?.username || "Player";
  const email = user?.email || "";

  const handleSignOut = () => {
    playClick();
    signOut();
  };

  const menuItems = [
    { icon: Wallet, label: "Wallet", sublabel: `Balance: ₹${balance?.toFixed(2) || "0.00"}`, href: "#" },
    { icon: History, label: "Transaction History", sublabel: "View all transactions", href: "#" },
    { icon: Settings, label: "Settings", sublabel: "Account settings", href: "#" },
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
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="border-primary/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{username}</h2>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-primary/20 to-teal-600/20 border-primary/30">
          <CardContent className="py-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-primary">
                ₹{loading ? "..." : balance?.toFixed(2) || "0.00"}
              </p>
            </div>
          </CardContent>
        </Card>

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
                  className={`flex items-center justify-between py-4 cursor-pointer hover:bg-secondary/30 px-2 rounded-lg transition-colors ${
                    index !== menuItems.length - 1 ? "border-b border-border/30" : ""
                  }`}
                  onClick={() => playClick()}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.sublabel}</p>
                    </div>
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
    </div>
  );
};

export default ProfilePage;
