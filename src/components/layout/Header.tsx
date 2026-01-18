import { Menu, Spade } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
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
      
      <div className="flex items-center gap-3">
        <button className="text-foreground/80 hover:text-foreground font-medium transition-colors">
          Log in
        </button>
        <Button className="btn-outline-light">
          REGISTER
        </Button>
      </div>
    </header>
  );
};

export default Header;
