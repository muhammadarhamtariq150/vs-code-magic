import { createFileRoute } from "@tanstack/react-router";
import PromoPage from "@/pages/PromoPage";

export const Route = createFileRoute("/promo")({
  component: PromoPage,
});
