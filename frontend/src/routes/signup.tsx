import { createFileRoute } from "@tanstack/react-router";
import StudentSignup from "@/screens/StudentSignup";
import { redirectIfAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/signup")({
  beforeLoad: ({ context }) => redirectIfAuthenticated(context),
  head: () => ({
    meta: [
      { title: "Create your BRICK student account" },
      {
        name: "description",
        content: "Sign up on BRICK, add your bio and lifestyle preferences, and start matching with student roommates.",
      },
      { property: "og:title", content: "Create your BRICK student account" },
      { property: "og:description", content: "Join BRICK and find a compatible student roommate." },
    ],
  }),
  component: StudentSignup,
});
