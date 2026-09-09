import { createFileRoute } from "@tanstack/react-router";
import Crash from "@/pages/games/Crash";

export const Route = createFileRoute("/games/crash")({
  component: Crash,
});
