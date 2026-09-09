import { createFileRoute } from "@tanstack/react-router";
import Blackjack21 from "@/pages/games/Blackjack21";

export const Route = createFileRoute("/games/21")({
  component: Blackjack21,
});
