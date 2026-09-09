import { createFileRoute } from "@tanstack/react-router";
import Wingo from "@/pages/games/Wingo";

export const Route = createFileRoute("/games/wingo")({
  component: Wingo,
});
