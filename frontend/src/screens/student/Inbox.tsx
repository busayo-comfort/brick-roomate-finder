import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useAuth } from "../../context/AuthContext";
import { api, type Connection, type ConnectionDetail, ApiError } from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import PageLoader from "../../components/PageLoader";
import { formatBudgetRange, formatDate } from "../../lib/format";
import { toast } from "sonner";
import {
  AtSign,
  CalendarDays,
  Check,
  Loader2,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

type Action = { id: string; type: "accepted" | "rejected" };

/**
 * These three live at module scope on purpose. Declaring a component inside
 * another component's body creates a brand-new component type on every render,
 * so React tears down and rebuilds the subtree each time instead of updating it.
 */
const StatusPill: React.FC<{ status: Connection["status"] }> = ({ status }) => (
  <span
    className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${status === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
  >
    {status}
  </span>
);

/** Contact details only exist on the API response once the request was accepted. */
const ContactCell: React.FC<{
  id: string;
  detail?: ConnectionDetail;
  revealing: boolean;
  onReveal: (id: string) => void;
}> = ({ id, detail, revealing, onReveal }) => {
  if (detail?.contactRevealed && detail.otherUser.email) {
    return (
      <a
        href={`mailto:${detail.otherUser.email}`}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
      >
        <AtSign size={15} /> {detail.otherUser.email}
      </a>
    );
  }
  return (
    <button
      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
      disabled={revealing}
      onClick={() => onReveal(id)}
    >
      <AtSign size={15} /> {revealing ? "Loading…" : "Show contact"}
    </button>
  );
};

const ActionButtons: React.FC<{
  connection: Connection;
  busy: boolean;
  onChoose: (action: Action) => void;
  size?: "sm" | "lg";
}> = ({ connection, busy, onChoose, size = "sm" }) => {
  const padding = size === "lg" ? "px-4 py-3 text-sm" : "px-3 py-2 text-sm";
  const grow = size === "lg" ? "flex-1" : "";
  return (
    <>
      <button
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 ${padding} ${grow}`}
        disabled={busy}
        onClick={() => onChoose({ id: connection.id, type: "accepted" })}
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        {busy ? "Working…" : "Accept"}
      </button>
      <button
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 ${padding} ${grow}`}
        disabled={busy}
        onClick={() => onChoose({ id: connection.id, type: "rejected" })}
      >
        <X size={15} /> Reject
      </button>
    </>
  );
};

const Inbox: React.FC = () => {
  const { isAuthenticated, authReady } = useAuth();
  const navigate = useNavigate();
  const [incoming, setIncoming] = useState<Connection[]>([]);
  const [outgoing, setOutgoing] = useState<Connection[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // The modal tracks an id, not a snapshot of the row: accepting from inside
  // the modal has to update what the modal itself is showing.
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Action | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Record<string, ConnectionDetail>>({});
  const [revealing, setRevealing] = useState<string | null>(null);

  const load = async () => {
    try {
      const [i, o] = await Promise.all([api.connections("incoming"), api.connections("outgoing")]);
      setIncoming(i);
      setOutgoing(o);
    } catch (e) {
      // A 401 here just means the session was not resolved yet; the auth
      // redirect below handles that case, so don't shout about it.
      if (!(e instanceof ApiError && e.status === 401)) {
        setError(e instanceof ApiError ? e.message : "Could not load connection requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  // The request goes out on mount instead of waiting for the session to
  // resolve first. Both are cookie-authenticated, so chaining them only added
  // a round trip of blank screen.
  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (authReady && !isAuthenticated) navigate("/login");
  }, [authReady, isAuthenticated, navigate]);

  // Still gated on the session so a signed-out visitor never sees a flash of
  // "no requests" before the redirect. The win is that `load()` above already
  // ran in parallel, so by the time this clears the data is usually here.
  if (!authReady || !isAuthenticated)
    return <PageLoader label="Loading your inbox" withSidebar />;

  const preview = previewId ? (incoming.find((c) => c.id === previewId) ?? null) : null;
  const person = (c: Connection, side: "requester" | "receiver") =>
    c[side]?.name || "BRICK student";

  const revealContact = async (id: string) => {
    setRevealing(id);
    try {
      const detail = await api.connection(id);
      setContacts((current) => ({ ...current, [id]: detail }));
      if (!detail.contactRevealed) {
        toast.info("Contact details unlock once the request is accepted.");
      }
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Could not load contact details.";
      setError(message);
      toast.error(message);
    } finally {
      setRevealing(null);
    }
  };

  /** Thin wrappers that bind the module-scope components to this screen's state. */
  const contactCell = (id: string) => (
    <ContactCell
      id={id}
      detail={contacts[id]}
      revealing={revealing === id}
      onReveal={(target) => void revealContact(target)}
    />
  );

  const actions = (connection: Connection, size?: "sm" | "lg") => (
    <ActionButtons
      connection={connection}
      busy={actingId === connection.id}
      onChoose={setConfirming}
      size={size}
    />
  );

  const confirmAction = async () => {
    if (!confirming) return;
    const { id, type } = confirming;
    const previous = incoming;
    const name = previous.find((c) => c.id === id)?.requester?.name || "this student";

    setActingId(id);
    setConfirming(null);
    // Optimistic: the row switches to its new status immediately and rolls
    // back if the API rejects it.
    setIncoming((current) =>
      current.map((connection) =>
        connection.id === id ? { ...connection, status: type } : connection,
      ),
    );

    try {
      if (type === "accepted") await api.acceptConnection(id);
      else await api.rejectConnection(id);

      setError("");
      toast.success(
        type === "accepted"
          ? `You accepted ${name}. Their contact details are now available.`
          : `You rejected ${name}'s request.`,
      );
      // Accepting is what unlocks the email, so fetch it right away rather than
      // making the user hunt for a second button.
      if (type === "accepted") void revealContact(id);
    } catch (e) {
      setIncoming(previous);
      const message = e instanceof ApiError ? e.message : "Could not update request.";
      setError(message);
      toast.error(message);
    } finally {
      setActingId(null);
    }
  };

  const pendingCount = incoming.filter((c) => c.status === "pending").length;

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-teal-600">
              Your inbox
            </p>
            <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-900">
              Connection requests
            </h1>
            <p className="mt-3 text-slate-500">
              Review people who want to connect and build your next living arrangement.
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
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Incoming requests</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {pendingCount} pending request(s)
                </p>
              </div>
              <span className="rounded-xl bg-teal-50 p-3 text-teal-600">
                <Mail size={20} />
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="space-y-3 px-5 py-6 sm:px-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : incoming.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <UserRound className="mx-auto text-slate-300" size={40} />
                  <p className="mt-3 font-medium text-slate-700">No requests yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    New roommate requests will appear here.
                  </p>
                </div>
              ) : (
                incoming.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-100 font-bold text-teal-700">
                        {connection.requester?.image ? (
                          <img
                            className="h-full w-full object-cover"
                            src={connection.requester.image}
                            alt=""
                          />
                        ) : (
                          person(connection, "requester")[0] || "B"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {person(connection, "requester")}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {connection.requester?.university || "University not listed"} ·{" "}
                          {connection.requester?.location || "Location flexible"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => setPreviewId(connection.id)}
                      >
                        View profile
                      </button>
                      {connection.status === "pending" ? (
                        actions(connection)
                      ) : (
                        <>
                          <StatusPill status={connection.status} />
                          {connection.status === "accepted" && contactCell(connection.id)}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-slate-900">Sent requests</h2>
              <p className="mt-1 text-sm text-slate-500">Track invitations you have sent.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="space-y-3 px-5 py-6 sm:px-6">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : outgoing.length === 0 ? (
                <p className="px-6 py-8 text-sm text-slate-500">No sent requests.</p>
              ) : (
                outgoing.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between px-5 py-4 sm:px-6"
                  >
                    <span className="font-medium text-slate-800">
                      {person(connection, "receiver")}
                    </span>
                    <div className="flex items-center gap-2">
                      {connection.status === "accepted" && contactCell(connection.id)}
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-600">
                        {connection.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      {preview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Profile of ${person(preview, "requester")}`}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-br from-slate-950 to-teal-900 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-teal-400 text-2xl font-bold text-slate-950">
                    {preview.requester?.image ? (
                      <img
                        src={preview.requester.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      person(preview, "requester")[0] || "B"
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{person(preview, "requester")}</h2>
                    <p className="mt-1 text-sm text-slate-300">
                      {preview.requester?.occupation || "Student"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewId(null)}
                  className="rounded-xl p-2 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Close profile"
                >
                  <X />
                </button>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-teal-100">
                <ShieldCheck size={16} /> Roommate applicant profile
              </div>
            </div>
            <div className="space-y-5 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">University</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {preview.requester?.university || "Not listed"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="mt-1 flex items-center gap-1 font-semibold text-slate-800">
                    <MapPin size={15} />
                    {preview.requester?.location || "Flexible"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Budget</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatBudgetRange(
                      preview.requester?.budgetMin,
                      preview.requester?.budgetMax,
                      "Not set",
                    )}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Move-in</p>
                  <p className="mt-1 flex items-center gap-1 font-semibold text-slate-800">
                    <CalendarDays size={15} />
                    {formatDate(preview.requester?.moveInDate)}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  About {person(preview, "requester")}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {preview.requester?.bio || "No bio added yet."}
                </p>
              </div>
              {preview.requester?.lifestyleTags && preview.requester.lifestyleTags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900">Lifestyle</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {preview.requester.lifestyleTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* The decision belongs here, next to the profile it is about.
                  Previously the modal was read-only, so a user who opened a
                  request to look it over had no way to act on it. */}
              <div className="border-t border-slate-100 pt-5">
                {preview.status === "pending" ? (
                  <div className="flex gap-3">{actions(preview, "lg")}</div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      You {preview.status} this request
                      <StatusPill status={preview.status} />
                    </div>
                    {preview.status === "accepted" && contactCell(preview.id)}
                  </div>
                )}
              </div>
              <button
                className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setPreviewId(null)}
              >
                Close profile
              </button>
            </div>
          </div>
        </div>
      )}
      {confirming && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${confirming.type === "accepted" ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-600"}`}
            >
              {confirming.type === "accepted" ? <Check /> : <X />}
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Are you sure?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {confirming.type === "accepted"
                ? "Accepting shares your email address with this student so you can plan the move together."
                : "This will reject the roommate connection request. It cannot be undone."}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setConfirming(null)}
              >
                Cancel
              </button>
              <button
                className={`rounded-xl px-4 py-3 text-sm font-semibold text-white ${confirming.type === "accepted" ? "bg-teal-600 hover:bg-teal-700" : "bg-rose-600 hover:bg-rose-700"}`}
                onClick={() => void confirmAction()}
              >
                {confirming.type === "accepted" ? "Accept" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Inbox;
