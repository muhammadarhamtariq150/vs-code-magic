import { createFileRoute } from "@tanstack/react-router";
import GemsMines from "@/pages/games/GemsMines";

export const Route = createFileRoute("/games/gems-mines")({
  component: GemsMines,
});
