import React, { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { Search, Users, Building2, ChevronRight, Loader2, AlertCircle, Lock } from "lucide-react";
import PageLoader from "../components/PageLoader";

const options = [
  {
    id: "seeker_full",
    role: "seeker" as const,
    title: "I need a roommate and an apartment",
    description: "Browse available places and get matched with compatible flatmates.",
    icon: Search,
    badge: "Popular",
    disabled: false,
  },
  {
    id: "seeker_roommate",
    role: "seeker" as const,
    title: "I already have an apartment & need a roommate",
    description: "Fill your open bed or room with verified student matches.",
    icon: Users,
    disabled: false,
  },
  {
    id: "landlord",
    role: "landlord" as const,
    title: "I'm a landlord or agent listing properties",
    description: "List verified accommodations and connect directly with student tenants.",
    icon: Building2,
    badge: "Coming Soon",
    disabled: true,
  },
];

export default function Onboarding() {
  const { currentUser, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const choose = async (role: "seeker" | "landlord", optionId: string, isDisabled: boolean) => {
    if (isDisabled) return;
    
    setLoadingId(optionId);
    setError("");
    try {
      await completeOnboarding(role);
      navigate(role === "seeker" ? "/student/profile" : "/student/dashboard");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save your selection.");
    } finally {
      setLoadingId(null);
    }
  };

  if (!currentUser) return <PageLoader label="Loading your account" />;

  return (
    <div className="min-h-[calc(100vh-70px)] bg-slate-50/60 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full uppercase">
            BRICK Journey
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
            What are you looking for?
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Choose the option that best describes your goal so we can customize your dashboard.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Options List */}
        <div className="grid gap-4">
          {options.map((option) => {
            const Icon = option.icon;
            const isLoading = loadingId === option.id;
            const isOptionDisabled = option.disabled || (loadingId !== null && loadingId !== option.id);

            return (
              <button
                key={option.id}
                type="button"
                disabled={isOptionDisabled}
                onClick={() => void choose(option.role, option.id, option.disabled)}
                className={`group relative text-left p-5 rounded-2xl border transition-all duration-200 shadow-sm
                  ${
                    option.disabled
                      ? "bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60 cursor-not-allowed grayscale-[30%]"
                      : loadingId !== null
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon Container */}
                  <div
                    className={`p-3 rounded-xl transition-colors duration-200 shrink-0 ${
                      option.disabled
                        ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                        : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2
                        className={`text-base font-semibold transition-colors ${
                          option.disabled
                            ? "text-slate-500 dark:text-slate-400"
                            : "text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                        }`}
                      >
                        {option.title}
                      </h2>
                      {option.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            option.disabled
                              ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                          }`}
                        >
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  {/* Action Icon / Lock / Loader */}
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                    ) : option.disabled ? (
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}