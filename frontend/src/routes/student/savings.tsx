import { createFileRoute } from "@tanstack/react-router";
import Savings from "@/screens/student/Savings";
import { requireAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/student/savings")({
  beforeLoad: ({ context }) => requireAuthenticated(context),
  head: () => ({
    meta: [
      { title: "Savings | BRICK" },
      { name: "description", content: "Track how much you are saving towards your rent with BRICK." },
      { property: "og:title", content: "Savings | BRICK" },
      { property: "og:description", content: "Your rent savings progress on BRICK." },
    ],
  }),
  component: Savings,
});
