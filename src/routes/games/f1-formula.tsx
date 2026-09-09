import { createFileRoute } from "@tanstack/react-router";
import F1Formula from "@/pages/games/F1Formula";

export const Route = createFileRoute("/games/f1-formula")({
  component: F1Formula,
});
