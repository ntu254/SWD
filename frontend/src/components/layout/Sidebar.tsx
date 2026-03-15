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
import { useQuery } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router-dom";

import { notificationsApi } from "../../api";
import { formatRoleLabel } from "../../lib/labels";
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
    { to: "/citizen/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { to: "/citizen/report", icon: AlertTriangle, label: "Báo cáo rác" },
    { to: "/citizen/reports", icon: FileText, label: "Báo cáo của tôi" },
    { to: "/citizen/notifications", icon: Bell, label: "Thông báo" },
    { to: "/citizen/rewards", icon: Award, label: "Phần thưởng" },
  ],
  COLLECTOR: [
    { to: "/collector/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { to: "/collector/tasks", icon: ListTodo, label: "Nhiệm vụ của tôi" },
    { to: "/collector/notifications", icon: Bell, label: "Thông báo" },
    { to: "/collector/map", icon: MapIcon, label: "Bản đồ nhiệm vụ" },
    { to: "/collector/performance", icon: TrendingUp, label: "Hiệu suất" },
    { to: "/collector/profile", icon: UserIcon, label: "Hồ sơ" },
  ],
  ENTERPRISE: [
    { to: "/enterprise/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { to: "/enterprise/reports", icon: BarChart3, label: "Báo cáo" },
    { to: "/enterprise/tasks", icon: ListTodo, label: "Nhiệm vụ" },
    { to: "/enterprise/capabilities", icon: MapIcon, label: "Phạm vi phục vụ" },
    { to: "/enterprise/notifications", icon: Bell, label: "Thông báo" },
    { to: "/enterprise/collectors", icon: UserCog, label: "Nhân viên thu gom" },
    { to: "/enterprise/reward-rules", icon: Gift, label: "Quy tắc thưởng" },
    { to: "/enterprise/analytics", icon: TrendingUp, label: "Phân tích" },
    // { to: "/enterprise/profile", icon: Building2, label: "Hồ sơ doanh nghiệp" },
  ],
  ADMIN: [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { to: "/admin/users", icon: Users, label: "Người dùng" },
    { to: "/admin/enterprises", icon: Building2, label: "Doanh nghiệp" },
    { to: "/admin/complaints", icon: MessageSquare, label: "Khiếu nại" },
    { to: "/admin/notifications", icon: Bell, label: "Thông báo" },
    { to: "/admin/reward-items", icon: Gift, label: "Vật phẩm thưởng" },
    { to: "/admin/settings", icon: Settings, label: "Cài đặt" },
  ],
};

type SidebarProps = {
  onNavigate?: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role) ?? "CITIZEN";
  const email = useAuthStore((state) => state.email) ?? "";
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const displayName = email.split("@")[0] || "Người dùng";
  const links = navByRole[role] ?? navByRole.CITIZEN;
  const { data: notificationsResponse } = useQuery({
    queryKey: ["sidebar-notifications", role],
    queryFn: () => notificationsApi.getForUser(0).then((response) => response.data),
    enabled: Boolean(accessToken) && role !== "ADMIN",
    refetchInterval: 60_000,
  });
  const notificationCount =
    role === "ADMIN" ? 0 : (notificationsResponse?.data?.totalElements ?? 0);

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
        <BrandMark compact caption={`Không gian ${formatRoleLabel(role).toLowerCase()}`} />
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
            Vai trò hiện tại
          </span>
          <span className="text-xs font-semibold text-[var(--primary-200)]">
            {formatRoleLabel(role)}
          </span>
        </div>
      </div>

      <nav className="relative z-10 mt-3 min-h-0 flex-1 space-y-1.5 overflow-hidden">
        <div className="px-2 pb-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-on-dark-muted)]">
            Điều hướng
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
                {link.to.endsWith("/notifications") && notificationCount > 0 ? (
                  <span className="rounded-full bg-[var(--primary-200)] px-2 py-0.5 text-[10px] font-semibold text-[var(--forest-900)]">
                    {notificationCount}
                  </span>
                ) : null}
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
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};
