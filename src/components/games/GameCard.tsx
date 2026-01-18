interface GameCardProps {
  name: string;
  image: string;
  isHot?: boolean;
  multiplier?: string;
  winTime?: string;
}

const GameCard = ({ name, image, isHot, multiplier, winTime }: GameCardProps) => {
  return (
    <div className="game-card group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {isHot && (
          <div className="hot-badge">HOT</div>
        )}
        
        {multiplier && (
          <div className="multiplier-badge">{multiplier}</div>
        )}
        
        {winTime && (
          <div className="absolute top-2 right-2 bg-blue-500 px-2 py-0.5 text-xs font-bold text-white rounded">
            {winTime}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
            Play Now
          </button>
        </div>
      </div>
      
      <div className="p-3 bg-card">
        <h3 className="text-sm font-semibold truncate">{name}</h3>
      </div>
    </div>
  );
};

export default GameCard;
