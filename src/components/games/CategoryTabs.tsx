import { Flame, Cherry, Clock } from "lucide-react";

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CategoryTabs = ({ activeTab, onTabChange }: CategoryTabsProps) => {
  const tabs = [
    { id: 'hot', icon: <Flame className="w-4 h-4" />, label: 'Hot' },
    { id: 'all', icon: <Cherry className="w-4 h-4" />, label: 'All' },
    { id: 'recently', icon: <Clock className="w-4 h-4" />, label: 'Recently' },
  ];

  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`category-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
