import { createFileRoute } from "@tanstack/react-router";
import PaymentSettings from "@/pages/admin/PaymentSettings";

export const Route = createFileRoute("/admin/finance/payment-settings")({
  component: PaymentSettings,
});
