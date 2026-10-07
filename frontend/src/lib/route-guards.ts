/**
 * Route-level auth middleware. These run in `beforeLoad`, so on a server render
 * they produce a real redirect response instead of a flash of the wrong page.
 */
import { redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { landingRouteFor, type SessionState } from "./session";

export interface GuardContext {
  session: SessionState;
}

/**
 * Keep signed-in users out of /login and /signup.
 * Safe to act on any truthy user — a user we can see is a user who is signed in.
 */
export function redirectIfAuthenticated({ session }: GuardContext): void {
  if (session.user) throw redirect({ to: landingRouteFor(session.user) });
}

/**
 * Keep signed-out users out of the app.
 * Only acts on a *resolved* session: when SSR cannot see the cookie we render
 * the page and let the client decide, rather than bouncing a logged-in user.
 */
export function requireAuthenticated({ session }: GuardContext): void {
  if (session.resolved && !session.user) throw redirect({ to: "/login" });
}

/**
 * Client-side backstop for `redirectIfAuthenticated`, used by the login and
 * signup screens.
 *
 * The `beforeLoad` guard can only redirect when the server actually saw the
 * session cookie. With the API on a different domain it never does, so a
 * signed-in user who opens /login gets the form served to them and the guard
 * never fires. This bounces them as soon as the browser resolves the session.
 */
export function useRedirectIfAuthenticated(): void {
  const { authReady, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authReady || !isAuthenticated || !currentUser) return;
    void navigate({ to: landingRouteFor(currentUser), replace: true });
  }, [authReady, isAuthenticated, currentUser, navigate]);
}
