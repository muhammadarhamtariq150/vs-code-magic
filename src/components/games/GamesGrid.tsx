import GameCard from "./GameCard";

const games = [
  { id: 1, name: "Win - 2 min", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop", isHot: true, winTime: "2 min" },
  { id: 2, name: "Super Ace", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop", isHot: true, multiplier: "1500X" },
  { id: 3, name: "Money Coming", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop", isHot: true, multiplier: "10000X" },
  { id: 4, name: "Crazy777", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop", isHot: true, multiplier: "3333X" },
  { id: 5, name: "Boxing King", image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=400&h=300&fit=crop", isHot: true },
  { id: 6, name: "Fortune Gems 2", image: "https://images.unsplash.com/photo-1579547621869-0ddb5f237392?w=400&h=300&fit=crop", isHot: true, multiplier: "5X" },
  { id: 7, name: "Jackpot Joker", image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&h=300&fit=crop", isHot: true },
  { id: 8, name: "Win - 1 min", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop", isHot: true, winTime: "1 min" },
  { id: 9, name: "Win - 5 min", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop", isHot: true, winTime: "5 min" },
  { id: 10, name: "Win - 3 min", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop", isHot: true, winTime: "3 min" },
  { id: 11, name: "Fortune Tiger", image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=400&h=300&fit=crop", isHot: true },
  { id: 12, name: "Golden Ox", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop", isHot: true },
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
          isHot={game.isHot}
          multiplier={game.multiplier}
          winTime={game.winTime}
        />
      ))}
    </div>
  );
};

export default GamesGrid;
