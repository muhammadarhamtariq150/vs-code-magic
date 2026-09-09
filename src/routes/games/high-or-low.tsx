import { createFileRoute } from "@tanstack/react-router";
import HighOrLow from "@/pages/games/HighOrLow";

export const Route = createFileRoute("/games/high-or-low")({
  component: HighOrLow,
});
