import React from "react";
import { Link } from "@/lib/router-compat";
import { Check, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  "Matched by university, budget and lifestyle",
  "See a clear compatibility score before you reach out",
  "Contact details stay private until you both agree",
];

/**
 * Shared shell for /login and /signup. Two columns on desktop so the form is
 * not a lonely box in the middle of a wide screen; a single centred column on
 * mobile. All spacing comes from Tailwind — the old screens used inline
 * `var(--spacing-*)` values that were never defined, so every gap collapsed.
 */
const AuthLayout: React.FC<{
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}> = ({ eyebrow, title, subtitle, icon, children, footer }) => (
  <div className="min-h-[calc(100vh-70px)] bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
    {/* Brand panel — desktop only */}
    <aside className="relative isolate hidden overflow-hidden bg-slate-950 px-12 py-16 lg:flex lg:flex-col lg:justify-center xl:px-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_15%,rgba(20,184,166,.25),transparent_35%),radial-gradient(circle_at_10%_85%,rgba(14,116,144,.22),transparent_32%)]" />
      <div className="max-w-md">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-sm font-medium text-teal-200">
          <Sparkles size={15} /> Built for student living
        </div>
        <h2 className="text-4xl font-bold leading-[1.1] tracking-[-.03em] text-white xl:text-5xl">
          Find a roommate who fits your life.
        </h2>
        <p className="mt-6 text-lg leading-8 text-slate-300">
          Join students already using BRICK to find compatible people to live with.
        </p>
        <ul className="mt-10 space-y-4">
          {HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[15px] leading-6 text-slate-300">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-300">
                <Check size={13} strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>

    {/* Form column */}
    <main className="flex items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            {icon}
          </div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-teal-600">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2.5 text-sm leading-6 text-slate-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>

        <p className="mt-8 text-center text-xs leading-5 text-slate-400">
          By continuing you agree to use BRICK respectfully.{" "}
          <Link to="/" className="font-medium text-slate-500 underline underline-offset-2">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  </div>
);

export default AuthLayout;

/** Shared field styles so both auth screens stay identical. */
export const authInput =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";
export const authLabel = "mb-2 block text-sm font-semibold text-slate-700";
export const authPrimaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60";
export const authGhostButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";
