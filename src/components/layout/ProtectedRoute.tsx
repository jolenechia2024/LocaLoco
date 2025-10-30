// components/layout/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';
import type { UserRole } from '../../types/auth';
import { useEffect } from 'react';


interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const location = useLocation();
  const store = useAuthStore();


    // Auto-login in development
    // useEffect(() => {
    //   const shouldAutoLogin = 
    //     import.meta.env.DEV && 
    //     import.meta.env.VITE_DEV_AUTO_LOGIN !== 'false' &&
    //     !isAuthenticated;
  
    //   if (shouldAutoLogin) {
    //     store.login('dev-user-1', 'user', 'dev-token-123');
    //   }
    // }, [isAuthenticated, store]);
  
  
    
  if (!isAuthenticated) {
    // Save where they were trying to go
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Wrong role - redirect to home
    return <Navigate to={ROUTES.MAP} replace />;
  }

  return <>{children}</>;
};