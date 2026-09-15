import { Flame, Gamepad2, Fish, Ticket, PlaySquare, Trophy, Radio, Dribbble } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TopCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const TopCategories = ({ activeCategory, onCategoryChange }: TopCategoriesProps) => {
  const { playClick, playHover } = useSound();

  const categories = [
    { id: "lobby", icon: Flame, label: "Lobby" },
    { id: "slot", icon: Gamepad2, label: "Slot" },
    { id: "fishing", icon: Fish, label: "Fishing" },
    { id: "lottery", icon: Ticket, label: "Lottery" },
    { id: "cards", icon: PlaySquare, label: "Cards" },
    { id: "contest", icon: Trophy, label: "Contest" },
    { id: "live", icon: Radio, label: "Live" },
    { id: "sports", icon: Dribbble, label: "Sports" },
  ];

  const handleClick = (id: string) => {
    playClick();
    onCategoryChange(id);
  };

  return (
    <div className="w-full bg-card border-b border-border md:hidden">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 px-3 py-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => handleClick(cat.id)}
                onMouseEnter={() => playHover()}
                className={`flex flex-col items-center justify-center min-w-[64px] py-2 px-2 rounded-lg border transition-all active:scale-95 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:text-primary hover:border-primary/40"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};

export default TopCategories;
