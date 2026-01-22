import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@shared/contexts';
import HomePage from './features/landing/pages/HomePage';
import AuthPage from './features/auth/pages/AuthPage';
import { RewardManagementPage } from '@features/reward-redemption';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin/rewards" element={<RewardManagementPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
