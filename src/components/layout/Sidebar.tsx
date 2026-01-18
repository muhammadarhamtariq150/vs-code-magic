import { Flame, Gamepad2, Fish, Ticket, PlaySquare, Trophy, Radio, Dribbble, ClipboardList, Crown, Gift } from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => (
  <div 
    className={`sidebar-item ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    <div className="text-2xl">{icon}</div>
    <span className="text-xs font-medium">{label}</span>
  </div>
);

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const Sidebar = ({ activeCategory, onCategoryChange }: SidebarProps) => {
  const mainCategories = [
    { id: 'lobby', icon: <Flame />, label: 'Lobby' },
    { id: 'slot', icon: <Gamepad2 />, label: 'Slot' },
    { id: 'fishing', icon: <Fish />, label: 'Fishing' },
    { id: 'lottery', icon: <Ticket />, label: 'Lottery' },
    { id: 'cards', icon: <PlaySquare />, label: 'Cards' },
    { id: 'contest', icon: <Trophy />, label: 'Contest' },
    { id: 'live', icon: <Radio />, label: 'Live' },
    { id: 'sports', icon: <Dribbble />, label: 'Sports' },
  ];

  return (
    <aside className="w-[140px] min-h-screen bg-sidebar p-3 flex flex-col gap-2 border-r border-border/30">
      <div className="grid grid-cols-2 gap-2">
        {mainCategories.map((cat) => (
          <SidebarItem
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            active={activeCategory === cat.id}
            onClick={() => onCategoryChange(cat.id)}
          />
        ))}
      </div>
      
      <div className="mt-4 p-3 rounded-xl bg-secondary/50 flex items-center gap-2 cursor-pointer hover:bg-secondary transition-colors">
        <ClipboardList className="text-primary" />
        <span className="text-sm font-medium text-primary">Bet Records</span>
      </div>
      
      <div className="mt-auto grid grid-cols-2 gap-2">
        <div className="rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform">
          <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-3 flex flex-col items-center">
            <Crown className="text-yellow-300 mb-1" />
            <span className="text-xs font-bold text-yellow-300">VIP</span>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-3 flex flex-col items-center">
            <Gift className="text-purple-200 mb-1" />
            <span className="text-xs font-bold text-purple-200">Promo</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
