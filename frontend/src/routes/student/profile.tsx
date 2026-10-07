import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/screens/student/Profile";
import { requireAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/student/profile")({
  beforeLoad: ({ context }) => requireAuthenticated(context),
  head: () => ({
    meta: [
      { title: "Your Profile | BRICK" },
      {
        name: "description",
        content: "Edit your BRICK bio and living preferences so potential roommates know who you are.",
      },
      { property: "og:title", content: "Your Profile | BRICK" },
      { property: "og:description", content: "Keep your bio and lifestyle details up to date." },
    ],
  }),
  component: Profile,
});
