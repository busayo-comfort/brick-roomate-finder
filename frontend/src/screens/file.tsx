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
import { LogIn, ArrowLeft, KeyRound, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { requestOtp, verifyOtp, signInWithPassword } = useAuth();
  const navigate = useNavigate();

  // Backstop for the `beforeLoad` guard when SSR could not see the cookie.
  useRedirectIfAuthenticated();

  const routeAfterLogin = (user: {
    userType: string | null;
    name: string;
    university?: string | null;
  }) => {
    if (!user.userType) {
      toast.info("This account is not finished yet. Let’s set up your BRICK profile.");
      navigate("/onboarding");
    } else if (!user.name.trim() || !user.university) {
      toast.info("Please complete your name and profile before finding roommates.");
      navigate("/student/profile");
    } else {
      navigate("/student/dashboard");
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "password") {
        routeAfterLogin(await signInWithPassword(email.trim(), password));
      } else if (!sent) {
        await requestOtp(email.trim());
        setSent(true);
      } else {
        routeAfterLogin(await verifyOtp(email.trim(), code.trim()));
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
      eyebrow="Welcome back"
      title={sent ? "Check your email" : "Log in to BRICK"}
      subtitle={
        sent
          ? `Enter the 6-digit code we sent to ${email}`
          : mode === "password"
            ? "Use the email and password on your account."
            : "We’ll email you a one-time code — no password needed."
      }
      icon={
        sent ? <ShieldCheck size={24} /> : mode === "password" ? <KeyRound size={24} /> : <LogIn size={24} />
      }
      footer={
        <>
          New to BRICK?{" "}
          <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-800">
            Create an account
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
                placeholder="name@example.com"
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
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
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
            <p className="mt-2.5 text-xs text-slate-400">
              The code expires in 5 minutes.
            </p>
          </div>
        )}

        <button className={authPrimaryButton} type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Please wait…
            </>
          ) : sent ? (
            "Verify & continue"
          ) : mode === "password" ? (
            "Log in"
          ) : (
            "Email me a login code"
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
                <KeyRound size={16} /> Log in with a password
              </>
            ) : (
              <>
                <LogIn size={16} /> Email me a code instead
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

export default Login;
