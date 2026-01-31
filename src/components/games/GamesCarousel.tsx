import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameCard from "./GameCard";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/useSound";

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
  // Slot games
  { id: 6, name: "Slots 777", image: slots777Img, url: "/games/slots-777", isHot: true, isInternal: true, category: "slot" },
  { id: 7, name: "Love Slots", image: loveSlotsImg, url: "/games/love-slots", isHot: true, isInternal: true, category: "slot" },
  { id: 8, name: "Crazy 777", image: crazy777Img, url: "/games/crazy-777", isHot: true, isInternal: true, category: "slot" },
  // Fishing games
  { id: 18, name: "Keno", image: kenoImg, url: "/games/keno", isHot: true, isInternal: true, category: "fishing" },
  { id: 20, name: "Chicken Road", image: chickenRoadImg, url: "/games/chicken-road", isHot: true, isInternal: true, category: "fishing" },
  // Lottery games
  { id: 1, name: "Gems Mines", image: gemsMinesImg, url: "/games/gems-mines", isHot: true, isInternal: true, category: "lottery" },
  { id: 2, name: "SOS", image: sosImg, url: "/games/sos", isHot: true, isInternal: true, category: "lottery" },
  { id: 3, name: "Lottery", image: lotteryImg, url: "/games/lottery", isHot: true, isInternal: true, category: "lottery" },
  { id: 4, name: "High or Low", image: highOrLowImg, url: "/games/high-or-low", isHot: true, isInternal: true, category: "lottery" },
  { id: 9, name: "Jackpot", image: jackpotImg, url: "/games/jackpot", isHot: true, isInternal: true, category: "lottery" },
  { id: 17, name: "Wheel of Fortune", image: wheelFortuneImg, url: "/games/wheel-fortune", isHot: true, isInternal: true, category: "lottery" },
  // Cards games
  { id: 5, name: "21", image: blackjack21Img, url: "/games/21", isHot: true, isInternal: true, category: "cards" },
  { id: 16, name: "Dragon Tiger", image: dragonTigerImg, url: "/games/dragon-tiger", isHot: true, isInternal: true, category: "cards" },
  // Other games (Live, Sports, etc.)
  { id: 10, name: "F1 Formula", image: f1FormulaImg, url: "/games/f1-formula", isHot: true, isInternal: true, category: "sports" },
  { id: 11, name: "PLINKO", image: plinkoImg, url: "/games/plinko", isHot: true, isInternal: true, category: "live" },
  { id: 12, name: "Wingo", image: wingoImg, url: "/games/wingo", isHot: true, isInternal: true, category: "live" },
  { id: 13, name: "Aviator", image: aviatorImg, url: "/games/aviator", isHot: true, isInternal: true, category: "live" },
  { id: 14, name: "Roulette", image: rouletteImg, url: "/games/roulette", isHot: true, isInternal: true, category: "live" },
  { id: 15, name: "Dice", image: diceImg, url: "/games/dice", isHot: true, isInternal: true, category: "live" },
  { id: 19, name: "Crash", image: crashImg, url: "/games/crash", isHot: true, isInternal: true, category: "live" },
];

interface GamesCarouselProps {
  searchQuery: string;
  activeCategory: string;
}

const GamesCarousel = ({ searchQuery, activeCategory }: GamesCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playClick } = useSound();

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "lobby" || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const scroll = (direction: "left" | "right") => {
    playClick();
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (filteredGames.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        No games found in this category
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Desktop Navigation Arrows */}
      <div className="hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Games Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-1 md:px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="flex-shrink-0 w-[calc(33.333%-8px)] min-w-[100px] max-w-[140px] sm:w-[140px] sm:max-w-none md:w-[160px] snap-start"
          >
            <GameCard
              name={game.name}
              image={game.image}
              url={game.url}
              isHot={game.isHot}
              isInternal={game.isInternal}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamesCarousel;
