import { createFileRoute } from "@tanstack/react-router";
import AviatorPredictor from "@/pages/AviatorPredictor";

export const Route = createFileRoute("/aviator-predictor")({
  component: AviatorPredictor,
});
