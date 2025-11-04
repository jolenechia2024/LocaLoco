import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore'; // Make sure this path is correct
import { ROUTES } from '../../constants/routes';
import type { UserRole } from '../../types/auth';
import { AnnouncementsPage } from '../AnnouncementPage'; 

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}
export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  // Existing authentication state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const login = useAuthStore((state) => state.login);
  const [autoLoginChecked, setAutoLoginChecked] = useState(false);
  
  // --- Start of Integrated Wrapper Logic ---
  const location = useLocation();
  const navigate = useNavigate();

  // Get state required for the AnnouncementsPage
  const businessUen = useAuthStore((state) => state.businessMode.currentBusinessUen);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  // --- End of Integrated Wrapper Logic ---

  // Auto-login in development
  useEffect(() => {
    const shouldAutoLogin =
      import.meta.env.DEV &&
      import.meta.env.VITE_DEV_AUTO_LOGIN !== 'false' &&
      !isAuthenticated;

    if (shouldAutoLogin) {
      login('dev-user-1', 'user', 'dev-token-123');
    }

    setAutoLoginChecked(true);
  }, []);

  // Wait for auto-login check before redirecting
  if (!autoLoginChecked) {
    return null; // Or a loading spinner
  }

  // Standard authentication check
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Standard role check
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={ROUTES.MAP} replace />;
  }

  // --- New Conditional Rendering for Announcements Route ---
  // Check if the current path is the announcements route
  if (location.pathname === ROUTES.ANNOUNCEMENTS) {
    // For this route, the user MUST be in business mode
    if (!businessUen) {
      // If not, redirect them to the home page
      return <Navigate to={ROUTES.HOME} replace />;
    }
    
    // If they are in business mode, render the AnnouncementsPage directly
    // This effectively "hijacks" the rendering from the routes.tsx file
    return (
      <AnnouncementsPage
        businessUen={businessUen}
        onBack={() => navigate(-1)} // Use navigate for the back function
        isDarkMode={isDarkMode}
      />
    );
  }

  // For all other protected routes, render the children passed from routes.tsx
  return <>{children}</>;
};
