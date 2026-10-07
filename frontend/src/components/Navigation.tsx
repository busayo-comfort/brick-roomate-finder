import React, { useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

/**
 * Placeholder shown while the session is still resolving.
 *
 * Rendering the logged-out navbar during that window is what produced the
 * "Login/Signup flashes, then swaps to the logged-in nav" glitch: an
 * unresolved session is not the same as a signed-out one, so we must not
 * commit to either answer yet. These blocks reserve the same footprint the
 * real buttons occupy, so nothing shifts when the answer arrives.
 */
const NavSkeleton: React.FC = () => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center" aria-hidden="true">
    <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
    <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
  </div>
);

const Navigation: React.FC = () => {
  const { isAuthenticated, logout, currentUser, authReady } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const signOut = async () => {
    await logout();
    close();
    navigate("/");
  };
  const links = [
    ["/student/dashboard", "Dashboard"],
    ["/student/roommates", "Find Roommates"],
    ["/student/messages", "Messages"],
    ["/student/profile", "Profile"],
    ["/student/savings", "Savings"],
  ];
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={close}
          className="flex items-center gap-2 font-bold text-slate-900 no-underline"
        >
          <img src={logo} alt="BRICK" className="h-9 w-9 object-contain" />
          <span>BRICK</span>
        </Link>
        <button
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div
          className={`${open ? "block" : "hidden"} absolute left-0 right-0 top-[70px] border-b border-slate-200 bg-white p-4 shadow-lg lg:static lg:block lg:border-0 lg:p-0 lg:shadow-none`}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {!authReady ? (
              <NavSkeleton />
            ) : isAuthenticated ? (
              <>
                <span className="hidden text-sm font-medium text-slate-500 lg:inline">
                  Welcome, {currentUser?.name}
                </span>
                {links.map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={close}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => void signOut()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  <LogOut size={17} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={close}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={close}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navigation;
