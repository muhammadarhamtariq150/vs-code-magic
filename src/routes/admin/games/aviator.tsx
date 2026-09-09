import { createFileRoute } from "@tanstack/react-router";
import AviatorControl from "@/pages/admin/AviatorControl";

export const Route = createFileRoute("/admin/games/aviator")({
  component: AviatorControl,
});
