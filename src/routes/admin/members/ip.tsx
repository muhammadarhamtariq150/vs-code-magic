import { createFileRoute } from "@tanstack/react-router";
import MemberIP from "@/pages/admin/MemberIP";

export const Route = createFileRoute("/admin/members/ip")({
  component: MemberIP,
});
