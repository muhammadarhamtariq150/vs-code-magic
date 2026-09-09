import { createFileRoute } from "@tanstack/react-router";
import Adjustment from "@/pages/admin/Adjustment";

export const Route = createFileRoute("/admin/finance/adjustment")({
  component: Adjustment,
});
