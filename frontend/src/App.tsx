import AdminLayout from '@features/admin/components/AdminLayout';
import AdminDashboard from '@features/admin/pages/AdminDashboard';
import CitizenLayout from '@features/citizen/components/CitizenLayout';
import CitizenDashboard from '@features/citizen/pages/CitizenDashboard';
import CitizenProfilePage from '@features/citizen/pages/CitizenProfilePage';
import ComplaintsPage from '@features/citizen/pages/ComplaintsPage';
import MyReportsPage from '@features/citizen/pages/MyReportsPage';
import ReportDetailPage from '@features/citizen/pages/ReportDetailPage';
import ReportWastePage from '@features/citizen/pages/ReportWastePage';
import RewardsPage from '@features/citizen/pages/RewardsPage';
import WasteMapPage from '@features/citizen/pages/WasteMapPage';
import CollectorLayout from '@features/collector/components/CollectorLayout';
import CollectorDashboard from '@features/collector/pages/CollectorDashboard';
import CollectorProfilePage from '@features/collector/pages/CollectorProfilePage';
import MyTasksPage from '@features/collector/pages/MyTasksPage';
import PerformancePage from '@features/collector/pages/PerformancePage';
import TaskDetailPage from '@features/collector/pages/TaskDetailPage';
import TaskHistoryPage from '@features/collector/pages/TaskHistoryPage';
import TaskMapPage from '@features/collector/pages/TaskMapPage';
import UploadProofPage from '@features/collector/pages/UploadProofPage';
import { ComplaintManagementPage } from '@features/complaint-management/pages/ComplaintManagementPage';
import {
  AnalyticsPage,
  CollectorPage,
  EnterpriseComplaintPage,
  EnterpriseDashboardPage,
  EnterpriseTaskManagementPage,
  RewardConfigPage,
} from '@features/enterprise';
import { NotificationManagementPage } from '@features/notification-management/pages/NotificationManagementPage';
import { RewardManagementPage } from '@features/reward-redemption';
import { UserManagementPage } from '@features/user-management';
import ForbiddenPage from '@shared/components/ForbiddenPage';
import RoleGuard from '@shared/components/RoleGuard';
import { AuthProvider } from '@shared/contexts';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import AuthPage from './features/auth/pages/AuthPage';
import HomePage from './features/landing/pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminLayout />
              </RoleGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="rewards" element={<RewardManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="notifications" element={<NotificationManagementPage />} />
            <Route path="complaints" element={<ComplaintManagementPage />} />
          </Route>

          {/* Enterprise */}
          <Route
            path="/enterprise"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'ENTERPRISE']}>
                <EnterpriseDashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/enterprise/tasks"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'ENTERPRISE']}>
                <EnterpriseTaskManagementPage />
              </RoleGuard>
            }
          />
          <Route
            path="/enterprise/collectors"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'ENTERPRISE']}>
                <CollectorPage />
              </RoleGuard>
            }
          />
          <Route
            path="/enterprise/complaints"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'ENTERPRISE']}>
                <EnterpriseComplaintPage />
              </RoleGuard>
            }
          />
          <Route
            path="/enterprise/analytics"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'ENTERPRISE']}>
                <AnalyticsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/enterprise/reward-config"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'ENTERPRISE']}>
                <RewardConfigPage />
              </RoleGuard>
            }
          />

          {/* Citizen */}
          <Route
            path="/citizen"
            element={
              <RoleGuard allowedRoles={['CITIZEN']}>
                <CitizenLayout />
              </RoleGuard>
            }
          >
            <Route index element={<CitizenDashboard />} />
            <Route path="report" element={<ReportWastePage />} />
            <Route path="my-reports" element={<MyReportsPage />} />
            <Route path="my-reports/:id" element={<ReportDetailPage />} />
            <Route path="map" element={<WasteMapPage />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="profile" element={<CitizenProfilePage />} />
          </Route>

          {/* Collector */}
          <Route
            path="/collector"
            element={
              <RoleGuard allowedRoles={['COLLECTOR']}>
                <CollectorLayout />
              </RoleGuard>
            }
          >
            <Route index element={<CollectorDashboard />} />
            <Route path="tasks" element={<MyTasksPage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
            <Route path="tasks/:id/proof" element={<UploadProofPage />} />
            <Route path="map" element={<TaskMapPage />} />
            <Route path="history" element={<TaskHistoryPage />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="profile" element={<CollectorProfilePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
