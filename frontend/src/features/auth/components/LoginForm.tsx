import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';

const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useLogin();
  const [creds, setCreds] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds.email || !creds.password) return;
    login(creds);
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="error-message global">{error}</div>}
        
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={creds.email}
            onChange={(e) => setCreds({...creds, email: e.target.value})}
            placeholder="example@mail.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu</label>
          <input 
            type="password" 
            value={creds.password}
            onChange={(e) => setCreds({...creds, password: e.target.value})}
            required
          />
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Đang kiểm tra...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;