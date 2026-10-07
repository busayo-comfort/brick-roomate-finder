import { createFileRoute } from "@tanstack/react-router";
import Inbox from "@/screens/student/Inbox";
import { requireAuthenticated } from "@/lib/route-guards";

export const Route = createFileRoute("/student/inbox")({
  beforeLoad: ({ context }) => requireAuthenticated(context),
  head: () => ({
    meta: [
      { title: "Inbox | BRICK" },
      {
        name: "description",
        content: "All your roommate conversations with last message previews and timestamps.",
      },
      { property: "og:title", content: "Inbox | BRICK" },
      {
        property: "og:description",
        content: "See every roommate thread, latest message and when it arrived.",
      },
    ],
  }),
  component: Inbox,
});
