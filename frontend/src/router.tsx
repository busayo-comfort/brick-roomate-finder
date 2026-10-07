import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Data fetched during SSR is reused by the client instead of being
        // refetched the moment the page hydrates.
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Warm a route on hover/touch so the click lands on an already-loaded page
    // rather than a spinner. `defaultPreloadStaleTime: 0` alone meant every
    // navigation paid full load latency.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 10_000,
  });

  return router;
};
