import GameCard from "./GameCard";

// Import game images
import gemsMinesImg from "@/assets/games/gems-mines.webp";
import sosImg from "@/assets/games/sos.png";
import lotteryImg from "@/assets/games/lottery.jfif";
import highOrLowImg from "@/assets/games/high-or-low.png";
import blackjack21Img from "@/assets/games/blackjack-21.jfif";
import slots777Img from "@/assets/games/slots-777.jfif";
import loveSlotsImg from "@/assets/games/love-slots.jfif";
import crazy777Img from "@/assets/games/crazy-777.jfif";
import jackpotImg from "@/assets/games/jackpot.jfif";
import f1FormulaImg from "@/assets/games/f1-formula.jfif";

const games = [
  { id: 1, name: "Gems Mines", image: gemsMinesImg, url: "/games/gems-mines", isHot: true, isInternal: true },
  { id: 2, name: "SOS", image: sosImg, url: "/games/sos", isHot: true, isInternal: true },
  { id: 3, name: "Lottery", image: lotteryImg, url: "/games/lottery", isHot: true, isInternal: true },
  { id: 4, name: "High or Low", image: highOrLowImg, url: "/games/high-or-low", isHot: true, isInternal: true },
  { id: 5, name: "21", image: blackjack21Img, url: "/games/21", isHot: true, isInternal: true },
  { id: 6, name: "Slots 777", image: slots777Img, url: "/games/slots-777", isHot: true, isInternal: true },
  { id: 7, name: "Love Slots", image: loveSlotsImg, url: "/games/love-slots", isHot: true, isInternal: true },
  { id: 8, name: "Crazy 777", image: crazy777Img, url: "/games/crazy-777", isHot: true, isInternal: true },
  { id: 9, name: "Jackpot", image: jackpotImg, url: "/games/jackpot", isHot: true, isInternal: true },
  { id: 10, name: "F1 Formula", image: f1FormulaImg, url: "/games/f1-formula", isHot: true, isInternal: true },
  { id: 11, name: "PLINKO", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop", url: "/games/plinko", isHot: true, isInternal: true },
  { id: 12, name: "Wingo", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop", url: "/games/wingo", isHot: true, isInternal: true },
  { id: 13, name: "Aviator", image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=300&fit=crop", url: "/games/aviator", isHot: true, isInternal: true },
];

interface GamesGridProps {
  searchQuery: string;
}

const GamesGrid = ({ searchQuery }: GamesGridProps) => {
  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredGames.map((game) => (
        <GameCard
          key={game.id}
          name={game.name}
          image={game.image}
          url={game.url}
          isHot={game.isHot}
          isInternal={'isInternal' in game && game.isInternal}
        />
      ))}
    </div>
  );
};

export default GamesGrid;
