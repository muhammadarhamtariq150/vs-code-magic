import { useNavigate } from "react-router-dom";
import { useSound } from "@/hooks/useSound";

interface GameCardProps {
  name: string;
  image: string;
  url: string;
  isHot?: boolean;
  isInternal?: boolean;
}

const GameCard = ({ name, image, url, isHot, isInternal }: GameCardProps) => {
  const navigate = useNavigate();
  const { playGame, playHover } = useSound();
  
  const handlePlay = () => {
    playGame();
    if (isInternal) {
      navigate(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleMouseEnter = () => {
    playHover();
  };

  return (
    <div 
      className="game-card group cursor-pointer relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
      onClick={handlePlay}
      onMouseEnter={handleMouseEnter}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {isHot && (
          <div className="hot-badge text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">HOT</div>
        )}
        
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Game name overlay on mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 sm:hidden">
          <h3 className="text-[10px] font-semibold text-white truncate drop-shadow-md">{name}</h3>
        </div>
        
        {/* Hover overlay for desktop */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="hidden sm:block absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
            Play Now
          </button>
        </div>
      </div>
      
      {/* Desktop game name */}
      <div className="hidden sm:block p-2 sm:p-3 bg-card">
        <h3 className="text-xs sm:text-sm font-semibold truncate">{name}</h3>
      </div>
    </div>
  );
};

export default GameCard;
