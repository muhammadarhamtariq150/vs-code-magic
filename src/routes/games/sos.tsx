import { createFileRoute } from "@tanstack/react-router";
import SOS from "@/pages/games/SOS";

export const Route = createFileRoute("/games/sos")({
  component: SOS,
});
