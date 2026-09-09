import { createFileRoute } from "@tanstack/react-router";
import AgentManagement from "@/pages/AgentManagement";

export const Route = createFileRoute("/agent-management")({
  component: AgentManagement,
});
