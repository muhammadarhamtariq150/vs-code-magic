import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import CategoryTabs from "@/components/games/CategoryTabs";
import SearchBar from "@/components/games/SearchBar";
import GamesGrid from "@/components/games/GamesGrid";
import FloatingActions from "@/components/games/FloatingActions";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("lobby");
  const [activeTab, setActiveTab] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
      
      <FloatingActions />
    </div>
  );
};

export default Index;
