import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

type LazyModule = Record<string, ComponentType<unknown>>;

function lazyPage(importer: () => Promise<unknown>, exportName: string) {
  return lazy(async () => {
    const module = (await importer()) as LazyModule;

    return {
      default: module[exportName],
    };
  });
}

const LoginPage = lazyPage(() => import("./pages/auth/LoginPage"), "LoginPage");
const RegisterPage = lazyPage(
  () => import("./pages/auth/RegisterPage"),
  "RegisterPage",
);
const CitizenDashboard = lazyPage(
  () => import("./pages/citizen/CitizenDashboard"),
  "CitizenDashboard",
);
const CitizenReportPage = lazyPage(
  () => import("./pages/citizen/CitizenReportPage"),
  "CitizenReportPage",
);
const CitizenReportsList = lazyPage(
  () => import("./pages/citizen/CitizenReportsList"),
  "CitizenReportsList",
);
const CitizenReportDetail = lazyPage(
  () => import("./pages/citizen/CitizenReportDetail"),
  "CitizenReportDetail",
);
const CitizenRewardsPage = lazyPage(
  () => import("./pages/citizen/CitizenRewardsPage"),
  "CitizenRewardsPage",
);
const CitizenComplaintsPage = lazyPage(
  () => import("./pages/citizen/CitizenComplaintsPage"),
  "CitizenComplaintsPage",
);
const NotificationsInboxPage = lazyPage(
  () => import("./pages/shared/NotificationsInboxPage"),
  "NotificationsInboxPage",
);
const CollectorDashboard = lazyPage(
  () => import("./pages/collector/CollectorDashboard"),
  "CollectorDashboard",
);
const CollectorTasksList = lazyPage(
  () => import("./pages/collector/CollectorTasksList"),
  "CollectorTasksList",
);
const CollectorTaskPage = lazyPage(
  () => import("./pages/collector/CollectorTaskPage"),
  "CollectorTaskPage",
);
const CollectorMapPage = lazyPage(
  () => import("./pages/collector/CollectorMapPage"),
  "CollectorMapPage",
);
const CollectorPerformancePage = lazyPage(
  () => import("./pages/collector/CollectorPerformancePage"),
  "CollectorPerformancePage",
);
const CollectorProfilePage = lazyPage(
  () => import("./pages/collector/CollectorProfilePage"),
  "CollectorProfilePage",
);
const EnterpriseDashboard = lazyPage(
  () => import("./pages/enterprise/EnterpriseDashboard"),
  "EnterpriseDashboard",
);
const EnterpriseReportsPage = lazyPage(
  () => import("./pages/enterprise/EnterpriseReportsPage"),
  "EnterpriseReportsPage",
);
const EnterpriseTasksPage = lazyPage(
  () => import("./pages/enterprise/EnterpriseTasksPage"),
  "EnterpriseTasksPage",
);
const EnterpriseTaskDetail = lazyPage(
  () => import("./pages/enterprise/EnterpriseTaskDetail"),
  "EnterpriseTaskDetail",
);
const EnterpriseCapabilitiesPage = lazyPage(
  () => import("./pages/enterprise/EnterpriseCapabilitiesPage"),
  "EnterpriseCapabilitiesPage",
);
const EnterpriseCollectorsPage = lazyPage(
  () => import("./pages/enterprise/EnterpriseCollectorsPage"),
  "EnterpriseCollectorsPage",
);
const EnterpriseRewardRulesPage = lazyPage(
  () => import("./pages/enterprise/EnterpriseRewardRulesPage"),
  "EnterpriseRewardRulesPage",
);
const EnterpriseAnalyticsPage = lazyPage(
  () => import("./pages/enterprise/EnterpriseAnalyticsPage"),
  "EnterpriseAnalyticsPage",
);
const EnterprisePickupPage = lazyPage(
  () => import("./pages/enterprise/EnterprisePickupPage"),
  "EnterprisePickupPage",
);
const EnterpriseProfilePage = lazyPage(
  () => import("./pages/enterprise/EnterpriseProfilePage"),
  "EnterpriseProfilePage",
);
const AdminDashboard = lazyPage(
  () => import("./pages/admin/AdminDashboard"),
  "AdminDashboard",
);
const AdminUsersPage = lazyPage(
  () => import("./pages/admin/AdminUsersPage"),
  "AdminUsersPage",
);
const AdminEnterprisesPage = lazyPage(
  () => import("./pages/admin/AdminEnterprisesPage"),
  "AdminEnterprisesPage",
);
const AdminComplaintsPage = lazyPage(
  () => import("./pages/admin/AdminComplaintsPage"),
  "AdminComplaintsPage",
);
const AdminNotificationsPage = lazyPage(
  () => import("./pages/admin/AdminNotificationsPage"),
  "AdminNotificationsPage",
);
const AdminRewardItemsPage = lazyPage(
  () => import("./pages/admin/AdminRewardItemsPage"),
  "AdminRewardItemsPage",
);
const AdminSettingsPage = lazyPage(
  () => import("./pages/admin/AdminSettingsPage"),
  "AdminSettingsPage",
);
const UnauthorizedPage = lazyPage(
  () => import("./pages/UnauthorizedPage"),
  "UnauthorizedPage",
);


const LayoutWrapper = () => <AppLayout />;

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="shell-panel w-full max-w-md p-8 text-center">
        <div className="mx-auto h-14 w-14 rounded-[22px] bg-[var(--primary-100)] p-3">
          <div className="shimmer h-full rounded-[14px]" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
          Đang tải không gian làm việc
        </p>
        <h1 className="mt-2 text-display text-3xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
          GreenLoop
        </h1>
      </div>
    </div>
  );
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={withSuspense(<LoginPage />)} />
          <Route path="/register" element={withSuspense(<RegisterPage />)} />
          <Route
            path="/unauthorized"
            element={withSuspense(<UnauthorizedPage />)}
          />


          <Route element={<ProtectedRoute allowedRoles={["CITIZEN"]} />}>
            <Route element={<LayoutWrapper />}>
              <Route
                path="/citizen/dashboard"
                element={withSuspense(<CitizenDashboard />)}
              />
              <Route
                path="/citizen/report"
                element={withSuspense(<CitizenReportPage />)}
              />
              <Route
                path="/citizen/reports"
                element={withSuspense(<CitizenReportsList />)}
              />
              <Route
                path="/citizen/reports/:id"
                element={withSuspense(<CitizenReportDetail />)}
              />
              <Route
                path="/citizen/rewards"
                element={withSuspense(<CitizenRewardsPage />)}
              />
              <Route
                path="/citizen/complaints"
                element={withSuspense(<CitizenComplaintsPage />)}
              />
              <Route
                path="/citizen/notifications"
                element={withSuspense(<NotificationsInboxPage />)}
              />
              <Route
                path="/citizen"
                element={<Navigate to="/citizen/dashboard" replace />}
              />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["COLLECTOR"]} />}>
            <Route element={<LayoutWrapper />}>
              <Route
                path="/collector/dashboard"
                element={withSuspense(<CollectorDashboard />)}
              />
              <Route
                path="/collector/tasks"
                element={withSuspense(<CollectorTasksList />)}
              />
              <Route
                path="/collector/notifications"
                element={withSuspense(<NotificationsInboxPage />)}
              />
              <Route
                path="/collector/tasks/:taskId"
                element={withSuspense(<CollectorTaskPage />)}
              />
              <Route
                path="/collector/map"
                element={withSuspense(<CollectorMapPage />)}
              />
              <Route
                path="/collector/performance"
                element={withSuspense(<CollectorPerformancePage />)}
              />
              <Route
                path="/collector/profile"
                element={withSuspense(<CollectorProfilePage />)}
              />
              <Route
                path="/collector"
                element={<Navigate to="/collector/dashboard" replace />}
              />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ENTERPRISE"]} />}>
            <Route element={<LayoutWrapper />}>
              <Route
                path="/enterprise/dashboard"
                element={withSuspense(<EnterpriseDashboard />)}
              />
              <Route
                path="/enterprise/reports"
                element={withSuspense(<EnterpriseReportsPage />)}
              />
              <Route
                path="/enterprise/tasks"
                element={withSuspense(<EnterpriseTasksPage />)}
              />
              <Route
                path="/enterprise/tasks/:taskId"
                element={withSuspense(<EnterpriseTaskDetail />)}
              />
              <Route
                path="/enterprise/capabilities"
                element={withSuspense(<EnterpriseCapabilitiesPage />)}
              />
              <Route
                path="/enterprise/notifications"
                element={withSuspense(<NotificationsInboxPage />)}
              />
              <Route
                path="/enterprise/collectors"
                element={withSuspense(<EnterpriseCollectorsPage />)}
              />
              <Route
                path="/enterprise/reward-rules"
                element={withSuspense(<EnterpriseRewardRulesPage />)}
              />
              <Route
                path="/enterprise/analytics"
                element={withSuspense(<EnterpriseAnalyticsPage />)}
              />
              <Route
                path="/enterprise/pickup"
                element={withSuspense(<EnterprisePickupPage />)}
              />
              <Route
                path="/enterprise/profile"
                element={withSuspense(<EnterpriseProfilePage />)}
              />
              <Route
                path="/enterprise"
                element={<Navigate to="/enterprise/dashboard" replace />}
              />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<LayoutWrapper />}>
              <Route
                path="/admin/dashboard"
                element={withSuspense(<AdminDashboard />)}
              />
              <Route
                path="/admin/users"
                element={withSuspense(<AdminUsersPage />)}
              />
              <Route
                path="/admin/enterprises"
                element={withSuspense(<AdminEnterprisesPage />)}
              />
              <Route
                path="/admin/complaints"
                element={withSuspense(<AdminComplaintsPage />)}
              />
              <Route
                path="/admin/notifications"
                element={withSuspense(<AdminNotificationsPage />)}
              />
              <Route
                path="/admin/reward-items"
                element={withSuspense(<AdminRewardItemsPage />)}
              />
              <Route
                path="/admin/settings"
                element={withSuspense(<AdminSettingsPage />)}
              />
              <Route
                path="/admin/reports"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </QueryClientProvider>
  );
}

export default App;
