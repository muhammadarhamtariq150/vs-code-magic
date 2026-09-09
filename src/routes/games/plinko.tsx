import { createFileRoute } from "@tanstack/react-router";
import Plinko from "@/pages/games/Plinko";

export const Route = createFileRoute("/games/plinko")({
  component: Plinko,
});
