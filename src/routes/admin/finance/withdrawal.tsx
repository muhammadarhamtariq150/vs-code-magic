import { createFileRoute } from "@tanstack/react-router";
import WithdrawalManagement from "@/pages/admin/WithdrawalManagement";

export const Route = createFileRoute("/admin/finance/withdrawal")({
  component: WithdrawalManagement,
});
