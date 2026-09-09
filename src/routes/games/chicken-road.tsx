import { createFileRoute } from "@tanstack/react-router";
import ChickenRoad from "@/pages/games/ChickenRoad";

export const Route = createFileRoute("/games/chicken-road")({
  component: ChickenRoad,
});
