import { createFileRoute } from "@tanstack/react-router";
import Roommates from "@/screens/student/Roommates";
import { requireAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/student/roommates")({
  beforeLoad: ({ context }) => requireAuthenticated(context),
  head: () => ({
    meta: [
      { title: "Find Roommates | BRICK" },
      {
        name: "description",
        content: "Browse compatible student roommates, read their bios and start a chat right from their profile card.",
      },
      { property: "og:title", content: "Find Roommates | BRICK" },
      { property: "og:description", content: "Filter by gender, location and budget to find your match." },
    ],
  }),
  component: Roommates,
});
