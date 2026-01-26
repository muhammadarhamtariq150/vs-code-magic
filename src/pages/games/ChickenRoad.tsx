import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChickenRoad = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Button>
      </div>
      
      <div className="flex-1 w-full">
        <iframe
          src="https://chickenroaad.lovable.app"
          className="w-full h-full min-h-[calc(100vh-80px)] border-0"
          title="Chicken Road Game"
          allow="fullscreen"
        />
      </div>
    </div>
  );
};

export default ChickenRoad;
