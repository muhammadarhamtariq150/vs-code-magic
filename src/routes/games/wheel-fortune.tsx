import { createFileRoute } from "@tanstack/react-router";
import WheelFortune from "@/pages/games/WheelFortune";

export const Route = createFileRoute("/games/wheel-fortune")({
  component: WheelFortune,
});
