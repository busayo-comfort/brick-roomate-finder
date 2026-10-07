import React from "react";
import { Link } from "@/lib/router-compat";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Home,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Sparkle,
  Users,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Smarter matching",
    text: "Find students who fit your budget, university, lifestyle, and move-in plans.",
  },
  {
    icon: Home,
    title: "A better place to live",
    text: "Coordinate your apartment search with people who are looking for the same kind of home.",
  },
  {
    icon: MessageCircle,
    title: "Connect with confidence",
    text: "Send a request and get to know potential roommates before making plans.",
  },
];

/** Mirrors the weights the matching service actually scores on. */
const matchFactors = [
  { icon: Wallet, label: "Budget overlap", weight: 30 },
  { icon: Sparkle, label: "Lifestyle tags", weight: 25 },
  { icon: CalendarDays, label: "Move-in timing", weight: 20 },
  { icon: Home, label: "Housing status", weight: 15 },
  { icon: Sparkles, label: "Cleanliness", weight: 15 },
  { icon: Moon, label: "Sleep schedule", weight: 15 },
  { icon: BookOpen, label: "Study habits", weight: 15 },
];

const steps = [
  {
    number: "01",
    title: "Create your profile",
    text: "Tell us your university, budget, preferences, and what you need next.",
  },
  {
    number: "02",
    title: "Discover your matches",
    text: "Browse compatible students ranked by a clear compatibility percentage.",
  },
  {
    number: "03",
    title: "Make the connection",
    text: "Send a request, start a conversation, and find your next home together.",
  },
];

const Landing: React.FC = () => (
  <div className="overflow-hidden bg-white text-slate-900">
    {/* ── Hero (unchanged) ───────────────────────────────────────────── */}
    <section className="relative isolate bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,.25),transparent_30%),radial-gradient(circle_at_15%_80%,rgba(14,116,144,.2),transparent_28%)]" />
      <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-sm font-medium text-teal-200">
            <Sparkles size={15} /> Built for student living
          </div>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-[-.04em] text-white sm:text-7xl">
            Find a roommate who fits your life.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
            BRICK helps students find compatible roommates and apartments without the guesswork.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
            >
              Get started free <ArrowRight size={17} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See how it works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="text-teal-400" size={16} /> University-based matching
            </span>
            <span className="flex items-center gap-2">
              <Check className="text-teal-400" size={16} /> Private account sessions
            </span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:ml-auto">
          <div className="absolute -inset-6 rounded-[2rem] bg-teal-400/10 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                    Your top match
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">A roommate that fits</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-700">
                  87%
                </span>
              </div>
              <div className="mt-6 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-700 text-xl font-bold text-white">
                  A
                </div>
                <div>
                  <p className="font-bold text-slate-900">Adaeze Okafor</p>
                  <p className="mt-1 text-sm text-slate-500">UNILAG · Yaba</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-xs text-slate-400">Budget range</p>
                  <p className="mt-1 font-semibold text-slate-800">₦150k – ₦250k</p>
                </div>
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-xs text-slate-400">Lifestyle</p>
                  <p className="mt-1 font-semibold text-slate-800">Tidy · Quiet</p>
                </div>
              </div>
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white">
                <MessageCircle size={16} /> Send connection request
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Trust strip ────────────────────────────────────────────────── */}
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-px bg-slate-200 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          { icon: ShieldCheck, title: "Safer connections", text: "Block and report tools built in" },
          { icon: Wallet, title: "Real budgets", text: "Matched on overlapping price ranges" },
          { icon: Users, title: "Same campus", text: "Only students from your university" },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-4 bg-white px-2 py-7 md:px-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Icon size={20} />
            </span>
            <div>
              <p className="font-semibold text-slate-900">{title}</p>
              <p className="mt-0.5 text-sm text-slate-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ── Why BRICK ──────────────────────────────────────────────────── */}
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-teal-600">Why BRICK</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Roommate hunting, made more human.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            Everything you need to move from searching to settling in with less stress.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/5"
            >
              <span className="absolute right-6 top-6 text-5xl font-bold text-slate-100 transition group-hover:text-teal-50">
                0{index + 1}
              </span>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-teal-300 transition group-hover:bg-teal-600 group-hover:text-white">
                <Icon size={22} />
              </div>
              <h3 className="relative mt-6 text-xl font-bold text-slate-900">{title}</h3>
              <p className="relative mt-3 text-[15px] leading-7 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── What goes into a match ─────────────────────────────────────── */}
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(20,184,166,.18),transparent_38%),radial-gradient(circle_at_5%_90%,rgba(14,116,144,.16),transparent_35%)]" />
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-teal-400">
            The compatibility score
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            No guesswork. Just what actually matters.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-300">
            Every match gets a percentage built from the things that make living together work — or
            not. You see the score before you ever reach out.
          </p>
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div
              className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
              style={{
                background: "conic-gradient(#2dd4bf 87%, rgba(255,255,255,.12) 87% 100%)",
              }}
            >
              <div className="flex h-[62px] w-[62px] flex-col items-center justify-center rounded-full bg-slate-950">
                <span className="text-lg font-bold text-white">87%</span>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Matches below <span className="font-semibold text-white">40%</span> are hidden
              entirely, so you only see people worth talking to.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {matchFactors.map(({ icon: Icon, label, weight }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-teal-400/40 hover:bg-white/10"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1 font-medium text-white">{label}</span>
              <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-white/10 sm:block">
                <div
                  className="h-full rounded-full bg-teal-400"
                  style={{ width: `${(weight / 30) * 100}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-sm font-bold text-teal-300">
                {weight} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── How it works ───────────────────────────────────────────────── */}
    <section id="how-it-works" className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-teal-600">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your next chapter starts with one good match.
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            Set your preferences once. BRICK does the hard work of finding people with a compatible
            way of living.
          </p>
        </div>

        <div className="relative mt-16">
          {/* connecting line, desktop only */}
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent lg:block" />
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative flex flex-col items-start lg:items-center">
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-teal-300 shadow-lg shadow-slate-900/20 ring-8 ring-slate-50">
                  {step.number}
                </span>
                <div className="mt-6 lg:text-center">
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-[15px] leading-7 text-slate-500 lg:mx-auto">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Create your profile <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>

    {/* ── Final CTA ──────────────────────────────────────────────────── */}
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,.28),transparent_55%)]" />
        <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-sm font-medium text-teal-200">
          <Sparkles size={15} /> Ready when you are
        </div>
        <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Make your next move with the right people.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-300">
          Join BRICK and start building a better student living experience today.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
          >
            Get started free <ArrowRight size={17} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            I already have an account
          </Link>
        </div>
        <p className="mt-7 text-sm text-slate-400">Free to join · No card required</p>
      </div>
    </section>

    {/* ── Footer ─────────────────────────────────────────────────────── */}
    <footer className="border-t border-slate-200 bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              BRICK<span className="text-teal-600">.</span>
            </span>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Student roommate matching, made simpler. Find people who fit how you actually live.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">Product</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a href="#how-it-works" className="text-slate-600 hover:text-teal-700">
                    How it works
                  </a>
                </li>
                <li>
                  <Link to="/signup" className="text-slate-600 hover:text-teal-700">
                    Create an account
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-slate-600 hover:text-teal-700">
                    Log in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">Safety</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Block &amp; report tools</li>
                <li>Private contact details</li>
                <li>Verified email sign-in</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-slate-200 pt-7 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} BRICK. All rights reserved.</span>
          <span>Made for Nigerian student communities.</span>
        </div>
      </div>
    </footer>
  </div>
);

export default Landing;
