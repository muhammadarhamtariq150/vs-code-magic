import { createFileRoute } from "@tanstack/react-router";
import BetRecords from "@/pages/BetRecords";

export const Route = createFileRoute("/bet-records")({
  component: BetRecords,
});
