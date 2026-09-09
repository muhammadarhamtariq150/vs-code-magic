import { createFileRoute } from "@tanstack/react-router";
import Roulette from "@/pages/games/Roulette";

export const Route = createFileRoute("/games/roulette")({
  component: Roulette,
});
