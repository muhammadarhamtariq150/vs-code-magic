import { createFileRoute } from "@tanstack/react-router";
import BettingRecords from "@/pages/admin/BettingRecords";

export const Route = createFileRoute("/admin/members/betting")({
  component: BettingRecords,
});
