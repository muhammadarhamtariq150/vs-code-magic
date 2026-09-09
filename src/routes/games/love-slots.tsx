import { createFileRoute } from "@tanstack/react-router";
import LoveSlots from "@/pages/games/LoveSlots";

export const Route = createFileRoute("/games/love-slots")({
  component: LoveSlots,
});
