import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@shared/contexts';
import HomePage from './features/landing/pages/HomePage';
import AuthPage from './features/auth/pages/AuthPage';
import { RewardManagementPage } from '@features/reward-redemption';
import { UserManagementPage } from '@features/user-management';
import { NotificationManagementPage } from '@features/notification-management/pages/NotificationManagementPage';
import { ComplaintManagementPage } from '@features/complaint-management/pages/ComplaintManagementPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin/rewards" element={<RewardManagementPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/notifications" element={<NotificationManagementPage />} />
          <Route path="/admin/complaints" element={<ComplaintManagementPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
