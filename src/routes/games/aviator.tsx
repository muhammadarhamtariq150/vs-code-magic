import { createFileRoute } from "@tanstack/react-router";
import Aviator from "@/pages/games/Aviator";

export const Route = createFileRoute("/games/aviator")({
  component: Aviator,
});
