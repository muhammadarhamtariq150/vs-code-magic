import { createFileRoute } from "@tanstack/react-router";
import WingoControl from "@/pages/admin/WingoControl";

export const Route = createFileRoute("/admin/games/wingo")({
  component: WingoControl,
});
