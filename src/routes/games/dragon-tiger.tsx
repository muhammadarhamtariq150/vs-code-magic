import { createFileRoute } from "@tanstack/react-router";
import DragonTiger from "@/pages/games/DragonTiger";

export const Route = createFileRoute("/games/dragon-tiger")({
  component: DragonTiger,
});
