import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "../../context/AuthContext";
import { api, ApiError } from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import PageLoader from "../../components/PageLoader";
import { formatNaira } from "../../lib/format";
import { ArrowRight, Home, MapPin, Users, Wallet } from "lucide-react";

const money = (value?: number | null) => formatNaira(value, "Not set");

const StudentDashboard: React.FC = () => {
  const { isAuthenticated, currentUser, authReady, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [matchesError, setMatchesError] = useState("");

  useEffect(() => {
    if (authReady && !isAuthenticated) navigate("/login");
    if (authReady && isAuthenticated && currentUser?.userType === "seeker" && !isProfileComplete) navigate("/student/profile");
  }, [authReady, isAuthenticated, isProfileComplete, currentUser?.userType, navigate]);

  useEffect(() => {
    if (!isAuthenticated || currentUser?.userType !== "seeker" || !isProfileComplete) return;
    void api.matches(1, 1).then(result => setMatchCount(result.meta.total)).catch((error: unknown) => setMatchesError(error instanceof ApiError ? error.message : "Matches unavailable"));
  }, [currentUser?.userType, isAuthenticated, isProfileComplete]);

  if (!authReady || !isAuthenticated || !currentUser)
    return <PageLoader label="Loading your dashboard" withSidebar />;
  const budget = currentUser.budgetMin != null || currentUser.budgetMax != null
    ? `${money(currentUser.budgetMin)} – ${money(currentUser.budgetMax)}`
    : "Not set";

  return <div className="min-h-[calc(100vh-70px)] bg-slate-50 lg:flex">
    <Sidebar />
    <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8"><p className="mb-2 text-sm font-semibold uppercase tracking-wider text-teal-600">Student dashboard</p><h1 className="m-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Welcome, {currentUser.name}</h1><p className="mt-3 text-base text-slate-500">Find a compatible roommate and plan your next move.</p></div>
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">Potential roommates</p><p className="mt-2 text-3xl font-bold text-slate-900">{matchCount ?? "—"}</p>{matchesError && <p className="mt-2 text-xs text-rose-600">{matchesError}</p>}</div><span className="rounded-xl bg-teal-50 p-3 text-teal-600"><Users size={24} /></span></div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">Monthly budget</p><p className="mt-2 text-2xl font-bold text-slate-900">{budget}</p><p className="mt-1 text-xs text-slate-400">From your saved seeker profile</p></div><span className="rounded-xl bg-amber-50 p-3 text-amber-600"><Wallet size={24} /></span></div></div>
        </section>
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><h2 className="m-0 text-xl font-semibold text-slate-900">Your profile</h2><Link to="/student/profile" className="text-sm font-semibold text-teal-600 hover:text-teal-700">Edit</Link></div><dl className="space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="text-right font-medium text-slate-800">{currentUser.email}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">University</dt><dd className="text-right font-medium text-slate-800">{currentUser.university || "Not set"}</dd></div><div className="flex justify-between gap-4"><dt className="flex items-center gap-2 text-slate-500"><MapPin size={15} /> Area</dt><dd className="text-right font-medium text-slate-800">{currentUser.location || "Not set"}</dd></div><div className="flex justify-between gap-4"><dt className="flex items-center gap-2 text-slate-500"><Wallet size={15} /> Budget</dt><dd className="text-right font-medium text-slate-800">{budget}</dd></div></dl><Link to="/student/profile" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">Update profile <ArrowRight size={16} /></Link></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="m-0 text-xl font-semibold text-slate-900">Quick actions</h2><p className="mt-2 text-sm text-slate-500">Keep your profile current and explore the latest matches.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Link to="/student/roommates" className="group rounded-xl border border-teal-100 bg-teal-50 p-4 transition hover:border-teal-300"><Home className="text-teal-600" size={22} /><span className="mt-3 block font-semibold text-slate-900">Browse roommates</span><span className="mt-1 block text-xs text-slate-500">See compatible students</span></Link><Link to="/student/profile" className="group rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"><Wallet className="text-slate-600" size={22} /><span className="mt-3 block font-semibold text-slate-900">Manage budget</span><span className="mt-1 block text-xs text-slate-500">Update your monthly range</span></Link></div></div>
        </section>
        {currentUser.bio && <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="m-0 text-xl font-semibold text-slate-900">About you</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{currentUser.bio}</p></section>}
      </div>
    </main>
  </div>;
};

export default StudentDashboard;
