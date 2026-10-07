import React, { useState } from "react";
import { useNavigate, Link } from "@/lib/router-compat";
import { useAuth } from "../context/AuthContext";
import { useRedirectIfAuthenticated } from "../lib/route-guards";
import { ApiError } from "../lib/api";
import AuthLayout, {
  authGhostButton,
  authInput,
  authLabel,
  authPrimaryButton,
} from "../components/AuthLayout";
import {
  UserPlus,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const StudentSignup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { requestOtp, verifyOtp, signUpWithPassword } = useAuth();
  const navigate = useNavigate();

  // Backstop for the `beforeLoad` guard when SSR could not see the cookie.
  useRedirectIfAuthenticated();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "password") {
        await signUpWithPassword(email.trim(), password);
        toast.success("Account created. Choose how you want to use BRICK.");
        navigate("/onboarding");
      } else if (!sent) {
        await requestOtp(email.trim());
        setSent(true);
      } else {
        await verifyOtp(email.trim(), code.trim());
        toast.success("Email verified. Choose how you want to use BRICK.");
        navigate("/onboarding");
      }
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Unable to contact BRICK. Check your connection.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetEmail = () => {
    setSent(false);
    setCode("");
    setError("");
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title={sent ? "Verify your email" : "Create your account"}
      subtitle={
        sent
          ? `Enter the 6-digit code we sent to ${email}`
          : mode === "password"
            ? "Pick an email and password to get started."
            : "Sign up with your email — we’ll send a one-time code."
      }
      icon={
        sent ? (
          <ShieldCheck size={24} />
        ) : mode === "password" ? (
          <KeyRound size={24} />
        ) : (
          <UserPlus size={24} />
        )
      }
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
            Log in
          </Link>
        </>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        {!sent ? (
          <>
            <div>
              <label htmlFor="email" className={authLabel}>
                Email address
              </label>
              <input
                id="email"
                className={authInput}
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>

            {mode === "password" && (
              <div>
                <label htmlFor="password" className={authLabel}>
                  Password
                </label>
                <input
                  id="password"
                  className={authInput}
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <p className="mt-2.5 text-xs leading-5 text-slate-400">
                  Needs an uppercase letter, a lowercase letter, and a number or symbol.
                </p>
              </div>
            )}
          </>
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="code" className="text-sm font-semibold text-slate-700">
                Verification code
              </label>
              <button
                type="button"
                onClick={handleResetEmail}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Change email
              </button>
            </div>
            <input
              id="code"
              className={`${authInput} text-center text-2xl font-bold tracking-[0.4em]`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              autoComplete="one-time-code"
              autoFocus
            />
            <p className="mt-2.5 text-xs text-slate-400">The code expires in 5 minutes.</p>
          </div>
        )}

        <button className={authPrimaryButton} type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Please wait…
            </>
          ) : sent ? (
            "Verify & create account"
          ) : mode === "password" ? (
            "Create account"
          ) : (
            "Email me a signup code"
          )}
        </button>
      </form>

      {!sent && (
        <>
          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <button
            className={authGhostButton}
            type="button"
            onClick={() => {
              setMode((current) => (current === "otp" ? "password" : "otp"));
              setPassword("");
              setError("");
            }}
            disabled={loading}
          >
            {mode === "otp" ? (
              <>
                <KeyRound size={16} /> Sign up with a password
              </>
            ) : (
              <>
                <Mail size={16} /> Sign up with an email code
              </>
            )}
          </button>
        </>
      )}

      {sent && (
        <button
          className={`${authGhostButton} mt-3`}
          type="button"
          onClick={handleResetEmail}
          disabled={loading}
        >
          <ArrowLeft size={16} /> Back to email
        </button>
      )}
    </AuthLayout>
  );
};

export default StudentSignup;
