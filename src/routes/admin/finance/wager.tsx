import { createFileRoute } from "@tanstack/react-router";
import WagerAdjustment from "@/pages/admin/WagerAdjustment";

export const Route = createFileRoute("/admin/finance/wager")({
  component: WagerAdjustment,
});
