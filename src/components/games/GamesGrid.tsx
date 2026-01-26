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
import plinkoImg from "@/assets/games/plinko.jfif";
import wingoImg from "@/assets/games/wingo.jfif";
import aviatorImg from "@/assets/games/aviator.jfif";
import rouletteImg from "@/assets/games/roulette.jpg";
import diceImg from "@/assets/games/dice.jpg";
import dragonTigerImg from "@/assets/games/dragon-tiger.jpg";
import wheelFortuneImg from "@/assets/games/wheel-fortune.jpg";
import kenoImg from "@/assets/games/keno.jpg";
import crashImg from "@/assets/games/crash.jpg";
import chickenRoadImg from "@/assets/games/chicken-road.jpg";

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
  { id: 11, name: "PLINKO", image: plinkoImg, url: "/games/plinko", isHot: true, isInternal: true },
  { id: 12, name: "Wingo", image: wingoImg, url: "/games/wingo", isHot: true, isInternal: true },
  { id: 13, name: "Aviator", image: aviatorImg, url: "/games/aviator", isHot: true, isInternal: true },
  { id: 14, name: "Roulette", image: rouletteImg, url: "/games/roulette", isHot: true, isInternal: true },
  { id: 15, name: "Dice", image: diceImg, url: "/games/dice", isHot: true, isInternal: true },
  { id: 16, name: "Dragon Tiger", image: dragonTigerImg, url: "/games/dragon-tiger", isHot: true, isInternal: true },
  { id: 17, name: "Wheel of Fortune", image: wheelFortuneImg, url: "/games/wheel-fortune", isHot: true, isInternal: true },
  { id: 18, name: "Keno", image: kenoImg, url: "/games/keno", isHot: true, isInternal: true },
  { id: 19, name: "Crash", image: crashImg, url: "/games/crash", isHot: true, isInternal: true },
  { id: 20, name: "Chicken Road", image: chickenRoadImg, url: "/games/chicken-road", isHot: true, isInternal: true },
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
