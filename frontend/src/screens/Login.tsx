import React, { useState } from "react";
import { useNavigate, Link } from "@/lib/router-compat";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { LogIn, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!sent) {
        await requestOtp(email.trim());
        setSent(true);
      } else {
        const user = await verifyOtp(email.trim(), code.trim());
        if (!user.userType) {
          toast.info("This account is not finished yet. Let’s set up your BRICK profile.");
          navigate("/onboarding");
        } else if (!user.name.trim() || !user.university) {
          toast.info("Please complete your name and profile before finding roommates.");
          navigate("/student/profile");
        } else {
          navigate("/student/dashboard");
        }
      }
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Unable to contact BRICK. Check your connection.";
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
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl border border-border shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Centered Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto">
            {sent ? <ShieldCheck className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {sent ? "Check your email" : "Log in to BRICK"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {sent ? (
                <>
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </>
              ) : (
                "Enter your email to receive a secure login code"
              )}
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={submit} className="space-y-5">
          {!sent ? (
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium leading-none">
                Email Address
              </label>
              <input
                id="email"
                className="w-full h-11 px-3.5 text-sm rounded-lg border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="code" className="block text-sm font-medium leading-none">
                  Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResetEmail}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <ArrowLeft className="w-3 h-3" /> Change email
                </button>
              </div>
              <input
                id="code"
                className="w-full h-12 text-center text-2xl font-bold tracking-[0.4em] rounded-lg border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
              />
            </div>
          )}

          <button
            className="w-full h-11 px-4 flex items-center justify-center gap-2 font-semibold text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : sent ? (
              "Verify & Continue"
            ) : (
              "Send Verification Code"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 text-center border-t border-border text-sm text-muted-foreground">
          New to BRICK?{" "}
          <Link to="/signup" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;