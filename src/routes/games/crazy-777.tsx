import { createFileRoute } from "@tanstack/react-router";
import Crazy777 from "@/pages/games/Crazy777";

export const Route = createFileRoute("/games/crazy-777")({
  component: Crazy777,
});
