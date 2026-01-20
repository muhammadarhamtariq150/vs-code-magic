import GameCard from "./GameCard";

const games = [
  { id: 1, name: "Gems Mines", image: "https://images.unsplash.com/photo-1579547621869-0ddb5f237392?w=400&h=300&fit=crop", url: "https://bright-gem-craft.lovable.app", isHot: true },
  { id: 2, name: "SOS", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop", url: "https://sosgame.lovable.app", isHot: true },
  { id: 3, name: "Lottery", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop", url: "https://lottery123.lovable.app", isHot: true },
  { id: 4, name: "High or Low", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop", url: "https://highorlow.lovable.app", isHot: true },
  { id: 5, name: "21", image: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=400&h=300&fit=crop", url: "https://black21jack.lovable.app", isHot: true },
  { id: 6, name: "Slots 777", image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&h=300&fit=crop", url: "https://vsc-clone-magic.lovable.app", isHot: true },
  { id: 7, name: "Love Slots", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop", url: "https://loveslots.lovable.app", isHot: true },
  { id: 8, name: "Crazy 777", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop", url: "https://crazy777.lovable.app", isHot: true },
  { id: 9, name: "Jackpot", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop", url: "https://crazyjackpot.lovable.app", isHot: true },
  { id: 10, name: "F1 Formula", image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=400&h=300&fit=crop", url: "https://f1frmula.lovable.app", isHot: true },
  { id: 11, name: "PLINKO", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop", url: "https://plinkoo.lovable.app", isHot: true },
  { id: 12, name: "Wingo", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop", url: "https://wingotrade.lovable.app", isHot: true },
  { id: 13, name: "Aviator", image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=300&fit=crop", url: "https://aviatorpro1.lovable.app", isHot: true },
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
        />
      ))}
    </div>
  );
};

export default GamesGrid;
