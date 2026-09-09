import { createFileRoute } from "@tanstack/react-router";
import ControllerApp from "@/pages/ControllerApp";

export const Route = createFileRoute("/controller")({
  component: ControllerApp,
});
