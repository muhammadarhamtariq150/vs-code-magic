import { createFileRoute } from "@tanstack/react-router";
import PersonalInfo from "@/pages/PersonalInfo";

export const Route = createFileRoute("/personal-info")({
  component: PersonalInfo,
});
