import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import TopCategories from "@/components/layout/TopCategories";
import BottomNav from "@/components/layout/BottomNav";
import CategoryTabs from "@/components/games/CategoryTabs";
import SearchBar from "@/components/games/SearchBar";
import GamesCarousel from "@/components/games/GamesCarousel";
import GamesGrid from "@/components/games/GamesGrid";
import FloatingActions from "@/components/games/FloatingActions";
import DepositDialog from "@/components/deposit/DepositDialog";
import BumperOfferDialog from "@/components/promo/BumperOfferDialog";
import PromoPage from "@/pages/PromoPage";
import ProfilePage from "@/pages/ProfilePage";
import { useIsMobile } from "@/hooks/use-mobile";
import { Gift, Megaphone, Sparkles, Trophy, UserPlus, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("lobby");
  const [activeTab, setActiveTab] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [bottomNavTab, setBottomNavTab] = useState("lobby");
  const [depositOpen, setDepositOpen] = useState(false);
  const isMobile = useIsMobile();

  // Handle bottom nav tab changes
  const handleBottomNavChange = (tab: string) => {
    setBottomNavTab(tab);
    if (tab === "lobby") {
      setActiveCategory("lobby");
    }
  };

  // Render content based on bottom nav selection (mobile only)
  const renderMobileContent = () => {
    switch (bottomNavTab) {
      case "promo":
        return <PromoPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return (
          <main className="flex-1 pb-24">
            <h1 className="sr-only">games7play — Online Casino and Betting Games</h1>
            <section className="px-3 pt-3" aria-label="Welcome offer">
              <div className="relative overflow-hidden rounded-lg bg-primary px-5 py-5 text-primary-foreground shadow-md">
                <Sparkles className="absolute right-4 top-4 h-5 w-5 text-accent" aria-hidden="true" />
                <p className="text-[11px] font-extrabold uppercase text-accent">Today only</p>
                <h2 className="mt-1 max-w-[250px] font-display text-2xl font-extrabold leading-tight">Deposit today and get a 50% bonus</h2>
                <Button size="sm" className="mt-4 h-8 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setDepositOpen(true)}>
                  Claim bonus
                </Button>
                <Gift className="absolute -bottom-3 right-4 h-20 w-20 text-primary-foreground/15" aria-hidden="true" />
              </div>
            </section>

            <div className="mx-3 mt-3 flex items-center gap-2 border-y border-border py-2 text-xs font-semibold text-muted-foreground">
              <Megaphone className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <p className="truncate">Play smart, win big — your next favorite game is ready.</p>
            </div>

            <section className="grid grid-cols-4 gap-2 px-3 py-3" aria-label="Rewards">
              {[
                { label: "Rewards", icon: Gift },
                { label: "Mission", icon: Trophy },
                { label: "Invite", icon: UserPlus },
                { label: "VIP", icon: Crown },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">{label}</span>
                </div>
              ))}
            </section>

            <div className="flex flex-col gap-3 border-t border-border px-3 py-3">
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery} 
              />
              <CategoryTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
            </div>
            
            <div className="px-3">
              <GamesGrid searchQuery={searchQuery} activeCategory={activeCategory} />
            </div>
          </main>
        );
    }
  };

  return (
    <div className="lobby-theme min-h-screen bg-background font-sans text-foreground">
      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <BumperOfferDialog onCta={() => setDepositOpen(true)} />
      <Header />
      
      {/* Mobile Layout */}
      {isMobile ? (
        <>
          {bottomNavTab === "lobby" && (
            <TopCategories 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />
          )}
          
          {renderMobileContent()}
          
          <BottomNav 
            activeTab={bottomNavTab} 
            onTabChange={handleBottomNavChange}
            onDepositOpen={() => setDepositOpen(true)}
          />
        </>
      ) : (
        /* Desktop Layout */
        <div className="flex">
          <Sidebar 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />
          
          <main className="flex-1 p-6">
            <h1 className="sr-only">games7play — Online Casino and Betting Games</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <CategoryTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery} 
              />
            </div>
            
            <GamesGrid searchQuery={searchQuery} activeCategory={activeCategory} />
          </main>
        </div>
      )}
      
      <FloatingActions />
    </div>
  );
};

export default Index;
