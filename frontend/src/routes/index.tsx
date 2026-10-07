import { createFileRoute } from "@tanstack/react-router";
import Landing from "@/screens/Landing";

export const Route = createFileRoute("/")({
  staleTime: 0,
  head: () => ({
    meta: [
      { title: "BRICK — Find Your Perfect Student Roommate in Nigeria" },
      {
        name: "description",
        content:
          "BRICK matches Nigerian students with compatible roommates by university, budget, location and lifestyle — then lets you chat before you move in.",
      },
      { property: "og:title", content: "BRICK — Student Roommate Matching" },
      {
        property: "og:description",
        content:
          "Match with compatible student roommates by university, budget and lifestyle, and chat directly in the app.",
      },
    ],
  }),
  component: Landing,
});
