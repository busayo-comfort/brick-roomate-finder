/**
 * Small compatibility layer so the migrated screens can keep using the
 * familiar `useNavigate('/path')` / `useLocation()` / `<Link to="...">` API
 * while the app actually runs on TanStack Router.
 */
import {
  Link,
  useLocation,
  useNavigate as useTanstackNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useCallback } from "react";

export { Link, useLocation, useSearch };

export function useNavigate() {
  const navigate = useTanstackNavigate();

  return useCallback(
    (to: string, options?: { replace?: boolean }) => {
      navigate({ to, replace: options?.replace });
    },
    [navigate],
  );
}
