import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useAuth } from "../../context/AuthContext";
import { api, type Match, type Connection, ApiError } from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import PageLoader from "../../components/PageLoader";
import { formatBudgetRange, formatDate } from "../../lib/format";
import { toast } from "sonner";
import {
  Ban,
  CalendarDays,
  Check,
  Flag,
  Home,
  MapPin,
  Send,
  Users,
  Wallet,
} from "lucide-react";

const TRAIT_LABELS: Record<string, string> = {
  "very-clean": "Very clean",
  average: "Average tidiness",
  messy: "Relaxed about mess",
  "early-bird": "Early bird",
  "night-owl": "Night owl",
  flexible: "Flexible hours",
  quiet: "Studies quietly",
  group: "Group study",
  library: "Studies at the library",
  any: "Studies anywhere",
};

/** Colour + wording tiers for the match score, used by the badge and the bar. */
const scoreTier = (score: number) =>
  score >= 80
    ? {
        label: "Excellent",
        badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        text: "text-emerald-700",
        bar: "bg-emerald-500",
      }
    : score >= 60
      ? {
          label: "Strong",
          badge: "bg-teal-50 text-teal-700 ring-teal-200",
          text: "text-teal-700",
          bar: "bg-teal-500",
        }
      : {
          label: "Good",
          badge: "bg-amber-50 text-amber-700 ring-amber-200",
          text: "text-amber-700",
          bar: "bg-amber-500",
        };

/** Human wording for a connection we have already sent. */
const STATUS_LABELS: Record<Connection["status"], string> = {
  pending: "Request sent",
  accepted: "Connected",
  rejected: "Declined",
  withdrawn: "Withdrawn",
};

/** One compact fact line: icon + value, truncated rather than wrapped. */
const Fact: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <div className="flex min-w-0 items-center gap-2 text-slate-600">
    <span className="shrink-0 text-teal-600">{icon}</span>
    <span className="truncate">{children}</span>
  </div>
);

const Roommates: React.FC = () => {
  const { currentUser, isAuthenticated, authReady } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<string | null>(null);
  const [reporting, setReporting] = useState<Match["user"] | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const load = async () => {
    try {
      const [result, outgoing] = await Promise.all([api.matches(), api.connections("outgoing")]);
      setMatches(result.data);
      setConnections(outgoing);
    } catch (e) {
      // 401 just means the session has not resolved yet — the redirect below
      // covers that, so don't surface it as a page error.
      if (!(e instanceof ApiError && e.status === 401)) {
        setError(e instanceof ApiError ? e.message : "Could not load matches.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount rather than after the session resolves. Waiting turned one
  // round trip into two before anything at all could paint.
  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (authReady && !isAuthenticated) navigate("/login");
  }, [authReady, isAuthenticated, navigate]);

  // Still gated on the session, so a signed-out visitor never sees a flash of
  // "no matches" before the redirect. The win is that `load()` above already
  // ran in parallel, so by the time this clears the data is usually here.
  if (!authReady || !isAuthenticated || !currentUser)
    return <PageLoader label="Loading matches" withSidebar />;

  const statusFor = (id: string) => connections.find((c) => c.receiverId === id)?.status;

  const blockUser = async (id: string, name: string) => {
    setBlocking(id);
    setError("");
    try {
      await api.blockUser(id);
      // The API already hides blocked users from /matches; drop it locally too.
      setMatches((previous) => previous.filter((match) => match.user.id !== id));
      toast.success(`${name} will no longer appear in your matches.`);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Could not block this user.";
      setError(message);
      toast.error(message);
    } finally {
      setBlocking(null);
    }
  };

  const submitReport = async () => {
    if (!reporting || reportReason.trim().length < 3) return;
    setSubmittingReport(true);
    try {
      await api.reportUser(reporting.id, reportReason.trim());
      toast.success("Thanks — our team will review this report.");
      setReporting(null);
      setReportReason("");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not submit the report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const sendRequest = async (id: string, name: string) => {
    setSending(id);
    setError("");
    try {
      const connection = await api.sendConnection(id);
      setConnections((previous) => [...previous, connection]);
      toast.success(`Request sent to ${name}. You'll hear back in your inbox.`);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Could not send request.";
      setError(message);
      toast.error(message);
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-teal-600">
              Matching
            </p>
            <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Find your roommate
            </h1>
            <p className="mt-3 text-slate-500">
              Matches are ranked using budget overlap, lifestyle, housing status, move-in timing,
              and gender preference.
            </p>
          </div>
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Users className="mx-auto text-slate-300" size={42} />
              <h2 className="mt-4 text-xl font-semibold text-slate-900">No matches yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Complete your university, budget, and gender preference to improve your matching
                results.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {matches.map(({ user, compatibilityScore }) => {
                const status = statusFor(user.id);
                const score = Math.round(compatibilityScore);
                const tier = scoreTier(score);
                const traits = [user.cleanliness, user.sleepSchedule, user.studyHabits].filter(
                  Boolean,
                ) as string[];
                const tags = user.lifestyleTags ?? [];
                const displayName = user.name || "BRICK student";

                return (
                  <article
                    key={user.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-teal-300 hover:shadow-lg"
                  >
                    {/* Match strength reads at a glance from the top edge —
                        no 96px dial needed to say "84%". */}
                    <div className="h-1 w-full bg-slate-100">
                      <div className={`h-full ${tier.bar}`} style={{ width: `${score}%` }} />
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      {/* Identity + score, one scannable row */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-600 text-base font-bold text-white">
                          {user.image ? (
                            <img src={user.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            displayName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-base font-bold leading-tight text-slate-900">
                            {displayName}
                          </h2>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {user.university || "University not listed"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold ring-1 ring-inset ${tier.badge}`}
                          title={`${tier.label} match — ${score}% compatibility`}
                        >
                          {score}%
                        </span>
                      </div>

                      {/* Housing status: a chip, not a full-width banner */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${user.hasApartment ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}
                        >
                          <Home size={11} />
                          {user.hasApartment ? "Has a place" : "Needs a place"}
                        </span>
                        <span className={`text-[11px] font-semibold ${tier.text}`}>
                          {tier.label} match
                        </span>
                      </div>

                      {user.bio && (
                        <p className="line-clamp-2 text-sm leading-5 text-slate-600">{user.bio}</p>
                      )}

                      {/* Key facts, two columns, one line each */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                        <Fact icon={<MapPin size={13} />}>{user.location || "Flexible"}</Fact>
                        <Fact icon={<CalendarDays size={13} />}>
                          {formatDate(user.moveInDate)}
                        </Fact>
                        <div className="col-span-2">
                          <Fact icon={<Wallet size={13} />}>
                            {formatBudgetRange(user.budgetMin, user.budgetMax)}
                          </Fact>
                        </div>
                      </div>

                      {/* Traits and tags share one row, capped so every card
                          stays the same height regardless of how many a
                          student added. */}
                      {(traits.length > 0 || tags.length > 0) && (
                        <div className="flex flex-wrap gap-1.5">
                          {traits.slice(0, 2).map((trait) => (
                            <span
                              key={trait}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                            >
                              {TRAIT_LABELS[trait] ?? trait}
                            </span>
                          ))}
                          {tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {traits.length + tags.length > 4 && (
                            <span
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                              title={[...traits.map((t) => TRAIT_LABELS[t] ?? t), ...tags].join(", ")}
                            >
                              +{traits.length + tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions pinned to the bottom so every card lines up */}
                      <div className="mt-auto flex items-center gap-2 pt-1">
                        <button
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                          disabled={!!status || sending === user.id}
                          onClick={() => void sendRequest(user.id, displayName)}
                        >
                          {status ? (
                            <>
                              <Check size={14} /> {STATUS_LABELS[status]}
                            </>
                          ) : sending === user.id ? (
                            "Sending…"
                          ) : (
                            <>
                              <Send size={14} /> Connect
                            </>
                          )}
                        </button>
                        <button
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
                          disabled={blocking === user.id}
                          title={`Block ${displayName}`}
                          aria-label={`Block ${displayName}`}
                          onClick={() => void blockUser(user.id, displayName)}
                        >
                          <Ban size={15} />
                        </button>
                        <button
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                          title={`Report ${displayName}`}
                          aria-label={`Report ${displayName}`}
                          onClick={() => {
                            setReporting(user);
                            setReportReason("");
                          }}
                        >
                          <Flag size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {reporting && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">
              Report {reporting.name || "this student"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tell us what happened. Reports are private and reviewed by the BRICK team.
            </p>
            <textarea
              className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              rows={4}
              maxLength={1000}
              autoFocus
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              placeholder="Describe the problem (at least 3 characters)"
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setReporting(null)}
                disabled={submittingReport}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={submittingReport || reportReason.trim().length < 3}
                onClick={() => void submitReport()}
              >
                {submittingReport ? "Sending…" : "Submit report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Roommates;
