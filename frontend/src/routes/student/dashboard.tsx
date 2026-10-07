import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/screens/student/Dashboard";
import { requireAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/student/dashboard")({
  beforeLoad: ({ context }) => requireAuthenticated(context),
  head: () => ({
    meta: [
      { title: "Dashboard | BRICK" },
      { name: "description", content: "Your BRICK dashboard: roommate matches, savings progress and recent messages." },
      { property: "og:title", content: "Dashboard | BRICK" },
      { property: "og:description", content: "Track your roommate search at a glance." },
    ],
  }),
  component: Dashboard,
});
