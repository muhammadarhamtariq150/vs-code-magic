import { createFileRoute } from "@tanstack/react-router";
import AgentPromoCode from "@/pages/AgentPromoCode";

export const Route = createFileRoute("/agent-promo-code")({
  component: AgentPromoCode,
});
