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
import PromoPage from "@/pages/PromoPage";
import ProfilePage from "@/pages/ProfilePage";
import { useIsMobile } from "@/hooks/use-mobile";

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
          <main className="flex-1 p-4 pb-20">
            <div className="flex flex-col gap-4 mb-4">
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery} 
              />
              <CategoryTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
            </div>
            
            <GamesCarousel searchQuery={searchQuery} activeCategory={activeCategory} />
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
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
            
            <GamesGrid searchQuery={searchQuery} />
          </main>
        </div>
      )}
      
      <FloatingActions />
    </div>
  );
};

export default Index;
