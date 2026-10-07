import React, { useState } from "react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Check, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";

/**
 * Mirrors the backend rule in `auth/dto/password.dto.ts` so the user is told
 * what is wrong before a round trip, never instead of one — the API still
 * enforces this and its message wins if the two ever drift.
 */
const RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number or symbol", test: (v) => /\d|\W/.test(v) },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:bg-slate-50";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const PasswordField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled?: boolean;
}> = ({ id, label, value, onChange, autoComplete, disabled }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={inputClass}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
};

/**
 * Security settings card.
 *
 * Accounts created through OTP have no password at all, so this renders in one
 * of two modes: "set a password" (no current password to prove) or "change
 * password" (current password required). `hasPassword` comes from the API —
 * the client never sees the hash itself.
 */
const SecuritySettings: React.FC = () => {
  const { currentUser, refreshSession } = useAuth();
  const hasPassword = currentUser?.hasPassword ?? true;

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const unmetRule = RULES.find((rule) => !rule.test(next));
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit =
    !saving && (hasPassword ? current.length > 0 : true) && !unmetRule && next === confirm;

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setDone(false);

    if (unmetRule) return setError(`Password needs ${unmetRule.label.toLowerCase()}.`);
    if (next !== confirm) return setError("The two new passwords do not match.");
    if (hasPassword && current === next)
      return setError("Your new password must be different from the current one.");

    setSaving(true);
    try {
      if (hasPassword) await api.updatePassword(current, next);
      else await api.setPassword(next);

      reset();
      setDone(true);
      toast.success(
        hasPassword
          ? "Password updated. Other devices have been signed out."
          : "Password set. You can now log in with it.",
      );
      // Flips `hasPassword` for accounts that just set one for the first time.
      await refreshSession().catch(() => undefined);
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Could not update your password. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <span className="rounded-xl bg-slate-900 p-2.5 text-teal-300">
          <ShieldCheck size={20} />
        </span>
        <div>
          <h2 className="m-0 text-xl font-semibold text-slate-900">Security</h2>
          <p className="mt-1 text-sm text-slate-500">
            {hasPassword
              ? "Change the password you use to sign in to BRICK."
              : "Your account signs in with email codes. Add a password for faster logins."}
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}
      {done && !error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Check size={16} />
          {hasPassword
            ? "Password updated. Sessions on your other devices were signed out."
            : "Password set successfully."}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-5">
        {/* Helps password managers associate the change with the right account. */}
        <input
          type="text"
          hidden
          readOnly
          autoComplete="username"
          value={currentUser?.email ?? ""}
        />

        {hasPassword && (
          <PasswordField
            id="current-password"
            label="Current password"
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
            disabled={saving}
          />
        )}

        <PasswordField
          id="new-password"
          label={hasPassword ? "New password" : "Password"}
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          disabled={saving}
        />

        {next.length > 0 && (
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {RULES.map((rule) => {
              const met = rule.test(next);
              return (
                <li
                  key={rule.label}
                  className={`flex items-center gap-2 text-xs ${met ? "text-emerald-600" : "text-slate-400"}`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${met ? "bg-emerald-100" : "bg-slate-100"}`}
                  >
                    {met && <Check size={11} />}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}

        <div>
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            disabled={saving}
          />
          {mismatch && <p className="mt-2 text-xs text-rose-600">Passwords do not match.</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <KeyRound size={16} /> {hasPassword ? "Update password" : "Set password"}
              </>
            )}
          </button>
          {hasPassword && (
            <p className="text-xs text-slate-400">
              You will stay signed in here; other devices are signed out.
            </p>
          )}
        </div>
      </form>
    </section>
  );
};

export default SecuritySettings;
