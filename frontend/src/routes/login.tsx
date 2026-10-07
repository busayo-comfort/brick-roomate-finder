import { createFileRoute } from "@tanstack/react-router";
import Login from "@/screens/file";
import { redirectIfAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => redirectIfAuthenticated(context),
  head: () => ({
    meta: [
      { title: "Log in to BRICK | Student Roommate Matching" },
      {
        name: "description",
        content: "Log in to BRICK to browse roommate matches, edit your bio and chat with potential roommates.",
      },
      { property: "og:title", content: "Log in to BRICK" },
      { property: "og:description", content: "Access your BRICK roommate matches and messages." },
    ],
  }),
  component: Login,
});
