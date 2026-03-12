import {
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Building2,
  ChevronRight,
  FileText,
  Gift,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Map as MapIcon,
  MessageSquare,
  Settings,
  TrendingUp,
  User as UserIcon,
  UserCog,
  Users,
} from "lucide-react";
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { cn } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { BrandMark } from "../ui/brand-mark";

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navByRole: Record<string, NavItem[]> = {
  CITIZEN: [
    { to: "/citizen/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/citizen/report", icon: AlertTriangle, label: "Report waste" },
    { to: "/citizen/reports", icon: FileText, label: "My reports" },
    { to: "/citizen/rewards", icon: Award, label: "Rewards" },
  ],
  COLLECTOR: [
    { to: "/collector/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/collector/tasks", icon: ListTodo, label: "My tasks" },
    { to: "/collector/map", icon: MapIcon, label: "Task map" },
    { to: "/collector/performance", icon: TrendingUp, label: "Performance" },
    { to: "/collector/profile", icon: UserIcon, label: "Profile" },
  ],
  ENTERPRISE: [
    { to: "/enterprise/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/enterprise/reports", icon: BarChart3, label: "Reports" },
    { to: "/enterprise/tasks", icon: ListTodo, label: "Tasks" },
    { to: "/enterprise/collectors", icon: UserCog, label: "Collectors" },
    { to: "/enterprise/reward-rules", icon: Gift, label: "Reward rules" },
    { to: "/enterprise/analytics", icon: TrendingUp, label: "Analytics" },
    { to: "/enterprise/profile", icon: Building2, label: "Company profile" },
  ],
  ADMIN: [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/enterprises", icon: Building2, label: "Enterprises" },
    { to: "/admin/complaints", icon: MessageSquare, label: "Complaints" },
    { to: "/admin/notifications", icon: Bell, label: "Notifications" },
    { to: "/admin/reward-items", icon: Gift, label: "Reward items" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
  ],
};

const roleLabel: Record<string, string> = {
  CITIZEN: "Citizen",
  COLLECTOR: "Collector",
  ENTERPRISE: "Enterprise",
  ADMIN: "Administrator",
};

type SidebarProps = {
  onNavigate?: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role) ?? "CITIZEN";
  const email = useAuthStore((state) => state.email) ?? "";
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const displayName = email.split("@")[0] || "User";
  const links = navByRole[role] ?? navByRole.CITIZEN;

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <aside
      className="relative flex h-screen min-h-0 flex-col overflow-hidden border border-[var(--stroke-dark)] p-3 text-[var(--text-on-dark)] shadow-[0_24px_44px_rgba(19,61,51,0.24)]"
      style={{ width: "var(--sidebar-width)", background: "var(--sidebar-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--sidebar-accent)" }}
      />

      <div className="relative z-10 rounded-[22px] border border-white/14 bg-white/8 px-3 py-3">
        <BrandMark compact caption={`${roleLabel[role] ?? role} workspace`} />
      </div>

      <div className="relative z-10 mt-3 rounded-[22px] border border-white/12 bg-white/7 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--primary-200)] text-xs font-bold text-[var(--forest-900)]">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[var(--text-on-dark)] sm:text-sm">
              {displayName}
            </p>
            <p className="truncate text-xs text-[var(--text-on-dark-muted)]">
              {email}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-2.5 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-on-dark-muted)]">
            Active role
          </span>
          <span className="text-xs font-semibold text-[var(--primary-200)]">
            {roleLabel[role] ?? role}
          </span>
        </div>
      </div>

      <nav className="relative z-10 mt-3 min-h-0 flex-1 space-y-1.5 overflow-hidden">
        <div className="px-2 pb-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-on-dark-muted)]">
            Navigation
          </p>
        </div>

        {links.map((link, index) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            style={{ animationDelay: `${index * 40}ms` }}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200",
                isActive ? "nav-active" : "nav-inactive",
              )
            }
          >
            {({ isActive }) => (
              <>
                <link.icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive
                      ? "text-[var(--text-on-dark)]"
                      : "text-[var(--text-on-dark-muted)]",
                  )}
                />
                <span className="flex-1">{link.label}</span>
                {isActive ? (
                  <ChevronRight className="h-3 w-3 text-[var(--primary-200)]" />
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative z-10 mt-3 rounded-[20px] border border-white/10 bg-white/7 p-2.5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-2xl border border-transparent px-3 py-2.5 text-xs font-semibold text-[var(--text-on-dark-muted)] transition-all duration-200 hover:border-white/10 hover:bg-white/8 hover:text-[var(--text-on-dark)] sm:text-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
