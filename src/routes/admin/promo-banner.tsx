import { createFileRoute } from "@tanstack/react-router";
import PromoBanner from "@/pages/admin/PromoBanner";

export const Route = createFileRoute("/admin/promo-banner")({
  component: PromoBanner,
});
