import GameCard from "./GameCard";

const games = [
  { id: 1, name: "Gems Mines", image: "https://images.unsplash.com/photo-1579547621869-0ddb5f237392?w=400&h=300&fit=crop", url: "/games/gems-mines", isHot: true, isInternal: true },
  { id: 2, name: "SOS", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop", url: "/games/sos", isHot: true, isInternal: true },
  { id: 3, name: "Lottery", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop", url: "/games/lottery", isHot: true, isInternal: true },
  { id: 4, name: "High or Low", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop", url: "/games/high-or-low", isHot: true, isInternal: true },
  { id: 5, name: "21", image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=400&h=300&fit=crop", url: "/games/21", isHot: true, isInternal: true },
  { id: 6, name: "Slots 777", image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&h=300&fit=crop", url: "/games/slots-777", isHot: true, isInternal: true },
  { id: 7, name: "Love Slots", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop", url: "/games/love-slots", isHot: true, isInternal: true },
  { id: 8, name: "Crazy 777", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop", url: "/games/crazy-777", isHot: true, isInternal: true },
  { id: 9, name: "Jackpot", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop", url: "/games/jackpot", isHot: true, isInternal: true },
  { id: 10, name: "F1 Formula", image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=400&h=300&fit=crop", url: "/games/f1-formula", isHot: true, isInternal: true },
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
