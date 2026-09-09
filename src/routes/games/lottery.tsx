import { createFileRoute } from "@tanstack/react-router";
import Lottery from "@/pages/games/Lottery";

export const Route = createFileRoute("/games/lottery")({
  component: Lottery,
});
