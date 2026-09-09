import { createFileRoute } from "@tanstack/react-router";
import FastPaymentCheck from "@/pages/admin/FastPaymentCheck";

export const Route = createFileRoute("/admin/finance/deposits")({
  component: FastPaymentCheck,
});
