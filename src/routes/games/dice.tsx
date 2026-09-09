import { createFileRoute } from "@tanstack/react-router";
import Dice from "@/pages/games/Dice";

export const Route = createFileRoute("/games/dice")({
  component: Dice,
});
