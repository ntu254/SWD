import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@shared/contexts';
import HomePage from './features/landing/pages/HomePage';
import AuthPage from './features/auth/pages/AuthPage';
import { RewardManagementPage } from '@features/reward-redemption';
import { UserManagementPage } from '@features/user-management';
import { NotificationManagementPage } from '@features/notification-management/pages/NotificationManagementPage';
import { ComplaintManagementPage } from '@features/complaint-management/pages/ComplaintManagementPage';
import {
  EnterpriseDashboardPage,
  EnterpriseTaskManagementPage,
  CollectorPage,
  EnterpriseComplaintPage,
  AnalyticsPage,
  RewardConfigPage,
} from '@features/enterprise';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Admin */}
          <Route path="/admin/rewards" element={<RewardManagementPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/notifications" element={<NotificationManagementPage />} />
          <Route path="/admin/complaints" element={<ComplaintManagementPage />} />

          {/* Enterprise */}
          <Route path="/enterprise" element={<EnterpriseDashboardPage />} />
          <Route path="/enterprise/tasks" element={<EnterpriseTaskManagementPage />} />
          <Route path="/enterprise/collectors" element={<CollectorPage />} />
          <Route path="/enterprise/complaints" element={<EnterpriseComplaintPage />} />
          <Route path="/enterprise/analytics" element={<AnalyticsPage />} />
          <Route path="/enterprise/reward-config" element={<RewardConfigPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
