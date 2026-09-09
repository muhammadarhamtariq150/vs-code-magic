import { createFileRoute } from "@tanstack/react-router";
import Keno from "@/pages/games/Keno";

export const Route = createFileRoute("/games/keno")({
  component: Keno,
});
