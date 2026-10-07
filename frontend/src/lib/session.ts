/**
 * Session loading that works on both sides of the render.
 *
 * On the server we forward the incoming `cookie` header to the API so the page
 * can be server-rendered already logged in. That only works when the app and
 * the API share a site (local dev, or a custom domain in front of both) — when
 * the API lives on another domain the browser never sends `brick.session_token`
 * to us, so SSR reports `resolved: false` and the client resolves it instead.
 * Guards must therefore only act on a *resolved* session.
 */
import { createServerFn } from "@tanstack/react-start";
import { API_URL, api, type ApiUser, type SeekerProfile } from "./api";

export interface SessionState {
  user: ApiUser | null;
  profile: SeekerProfile | null;
  /** `false` means "could not determine" — never treat it as logged out. */
  resolved: boolean;
}

export const EMPTY_SESSION: SessionState = { user: null, profile: null, resolved: false };

const SESSION_COOKIE = "brick.session_token";

/**
 * Upper bound on how long a server render will wait for the API. Without it a
 * slow or unreachable API holds the whole HTML response open; past this we fall
 * back to an unresolved session and let the client finish the job.
 */
const SSR_TIMEOUT_MS = 4000;

const fetchSessionOnServer = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionState> => {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const cookie = getRequestHeader("cookie");

    // No API session cookie visible to this origin — we cannot know the state.
    if (!cookie || !cookie.includes(SESSION_COOKIE)) return EMPTY_SESSION;

    const get = async <T>(path: string): Promise<T | null> => {
      const response = await fetch(`${API_URL}${path}`, {
        headers: { cookie, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(SSR_TIMEOUT_MS),
      });
      if (!response.ok) return null;
      const payload = (await response.json().catch(() => null)) as { data?: T } | null;
      return payload?.data ?? null;
    };

    try {
      // Both requests go out together. Awaiting the user first and only then
      // asking for the profile doubled the API latency of every server render,
      // which is time the browser spends staring at nothing. The profile is
      // simply discarded for non-seekers.
      const [user, profile] = await Promise.all([
        get<ApiUser>("/auth/session"),
        get<SeekerProfile>("/profile/seeker"),
      ]);
      if (!user) return { user: null, profile: null, resolved: true };
      return { user, profile: user.userType === "seeker" ? profile : null, resolved: true };
    } catch {
      return EMPTY_SESSION;
    }
  },
);

async function fetchSessionOnClient(): Promise<SessionState> {
  try {
    // Parallel for the same reason as the server path: the profile request does
    // not depend on the session response, only on how we interpret it.
    const [user, profile] = await Promise.all([
      api.session(),
      api.getProfile().catch(() => null),
    ]);
    if (!user) return { user: null, profile: null, resolved: true };
    return { user, profile: user.userType === "seeker" ? profile : null, resolved: true };
  } catch {
    return { user: null, profile: null, resolved: true };
  }
}

/**
 * Deduped on the client so root `beforeLoad` does not refetch the session on
 * every navigation. Call `invalidateSession()` after login/logout.
 */
let clientSession: Promise<SessionState> | null = null;

export function loadSession(): Promise<SessionState> {
  if (import.meta.env.SSR) return fetchSessionOnServer();
  if (!clientSession) clientSession = fetchSessionOnClient();
  return clientSession;
}

export function invalidateSession(): void {
  clientSession = null;
}

/** Seed the client cache after an in-app login so guards agree immediately. */
export function primeSession(state: SessionState): void {
  if (!import.meta.env.SSR) clientSession = Promise.resolve(state);
}

/** Where a freshly authenticated user belongs. Only the account type matters. */
export function landingRouteFor(user: {
  userType: ApiUser["userType"];
}): "/onboarding" | "/student/dashboard" {
  return user.userType ? "/student/dashboard" : "/onboarding";
}
