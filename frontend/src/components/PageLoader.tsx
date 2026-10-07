import React from "react";

/**
 * Shown while the session or a page's data is still resolving. Screens used to
 * return `null` here, which painted a blank white page between navigation and
 * data arriving.
 */
const PageLoader: React.FC<{ label?: string; withSidebar?: boolean }> = ({
  label = "Loading…",
  withSidebar = false,
}) => (
  <div className="min-h-[calc(100vh-70px)] bg-slate-50 lg:flex">
    {withSidebar && (
      <div className="w-full shrink-0 bg-slate-950 lg:min-h-[calc(100vh-70px)] lg:w-64">
        <div className="space-y-3 p-4 lg:p-6">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-28 animate-pulse rounded bg-slate-800" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-9 animate-pulse rounded-xl bg-slate-800/70" />
            ))}
          </div>
        </div>
      </div>
    )}
    <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <span className="sr-only" role="status">
          {label}
        </span>
        <div className="mb-8 space-y-3">
          <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-9 w-72 max-w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default PageLoader;
