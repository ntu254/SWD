import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './features/landing/pages/HomePage';
import AuthPage from './features/auth/pages/AuthPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
