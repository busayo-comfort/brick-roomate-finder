import { createFileRoute } from "@tanstack/react-router";
import Messages from "@/screens/student/Messages";
import { requireAuthenticated } from "@/lib/route-guards";

type MessagesSearch = { with?: string };

export const Route = createFileRoute("/student/messages")({
  beforeLoad: ({ context }) => requireAuthenticated(context),
  validateSearch: (search: Record<string, unknown>): MessagesSearch => ({
    with: typeof search.with === "string" ? search.with : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Messages | BRICK" },
      { name: "description", content: "Chat with potential roommates before you decide to live together." },
      { property: "og:title", content: "Messages | BRICK" },
      { property: "og:description", content: "Your roommate conversations in one place." },
    ],
  }),
  component: Messages,
});
