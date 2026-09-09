import { createFileRoute } from "@tanstack/react-router";
import MemberDetails from "@/pages/admin/MemberDetails";

export const Route = createFileRoute("/admin/members")({
  component: MemberDetails,
});
