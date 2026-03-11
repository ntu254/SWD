import { useAuth } from '@shared/contexts/AuthContext';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

/**
 * Bảo vệ route theo role.
 * - Chưa đăng nhập → redirect /auth
 * - Đăng nhập nhưng sai role → trang 403
 * - Đúng role → render children
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const role = (user.role || '').toUpperCase();
  const allowed = allowedRoles.map(r => r.toUpperCase());

  if (!allowed.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
