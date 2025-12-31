import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import RegisterPage from './features/auth/pages/RegisterPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import WelcomePage from './features/auth/pages/WelcomePage';
import LoginPage from './features/auth/pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/" element={<div>Home Page (Đã đăng nhập)</div>} />
        
        {/* Auth Features Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;