import React, { useEffect, useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import { Inbox, LayoutDashboard, MessageCircle, User, Users, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [unreadRequests, setUnreadRequests] = useState(0);
  useEffect(() => {
    if (!currentUser?.id || currentUser.userType !== "seeker") return;
    void api
      .connections("incoming")
      .then((connections) =>
        setUnreadRequests(
          connections.filter((connection) => connection.status === "pending").length,
        ),
      )
      .catch(() => setUnreadRequests(0));
  }, [currentUser?.id, currentUser?.userType, location.pathname]);
  const links = [
    ["/student/dashboard", "Dashboard", LayoutDashboard],
    ["/student/roommates", "Find Roommates", Users],
    ["/student/inbox", "Inbox", Inbox],
    ["/student/messages", "Messages", MessageCircle],
    ["/student/savings", "Savings", Wallet],
    ["/student/profile", "Profile", User],
  ] as const;
  return (
    <aside className="w-full shrink-0 bg-slate-950 text-white lg:min-h-[calc(100vh-70px)] lg:w-64">
      <div className="p-4 lg:sticky lg:top-0 lg:p-6">
        <div className="mb-5 flex items-center justify-between lg:mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">BRICK</p>
            <p className="mt-1 text-sm text-slate-400">{currentUser?.name}</p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2">
          {links.map(([to, label, Icon]) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition lg:w-full ${active ? "bg-teal-600 text-white shadow-lg shadow-teal-950/30" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {label === "Inbox" && unreadRequests > 0 && (
                  <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                    {unreadRequests > 99 ? "99+" : unreadRequests}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
export default Sidebar;
