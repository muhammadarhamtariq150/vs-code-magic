import { createFileRoute } from "@tanstack/react-router";
import MemberFinancialRecords from "@/pages/admin/MemberFinancialRecords";

export const Route = createFileRoute("/admin/members/financial")({
  component: MemberFinancialRecords,
});
