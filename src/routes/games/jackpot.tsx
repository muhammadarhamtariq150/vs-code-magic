import { createFileRoute } from "@tanstack/react-router";
import Jackpot from "@/pages/games/Jackpot";

export const Route = createFileRoute("/games/jackpot")({
  component: Jackpot,
});
