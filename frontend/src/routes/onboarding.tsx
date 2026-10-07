import { createFileRoute } from "@tanstack/react-router";
import Onboarding from "@/screens/Onboarding";
import { requireAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: ({ context }) => requireAuthenticated(context),
  head: () => ({
    meta: [
      { title: "Set up your BRICK account" },
      {
        name: "description",
        content: "Tell BRICK whether you are looking for a roommate, a place, or listing one.",
      },
    ],
  }),
  component: Onboarding,
});
