// components/layout/MainLayout.tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../AppSidebar';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ROUTES } from '../../constants/routes';
import { mockUser } from '../../data/mockUserData';
import { mockBusinessOwner } from '../../data/mockBusinessOwnerData';

export const MainLayout = () => {
  const { role, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current view from pathname
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === ROUTES.MAP) return 'map';
    if (path === ROUTES.BUSINESSES) return 'list';
    if (path === ROUTES.BOOKMARKS) return 'bookmarks';
    if (path === ROUTES.PROFILE) return 'profile';
    if (path === ROUTES.FORUM) return 'forum';
    if (path === ROUTES.NOTIFICATIONS) return 'notifications';
    if (path === ROUTES.SETTINGS) return 'settings';
    if (path === ROUTES.VOUCHERS) return 'vouchers';
    return 'list';
  };

  const handleNavigate = (view: string) => {
    const routeMap: Record<string, string> = {
      map: ROUTES.MAP,
      list: ROUTES.BUSINESSES,
      bookmarks: ROUTES.BOOKMARKS,
      profile: ROUTES.PROFILE,
      forum: ROUTES.FORUM,
      notifications: ROUTES.NOTIFICATIONS,
      settings: ROUTES.SETTINGS,
      vouchers: ROUTES.VOUCHERS,
      filters: ROUTES.BUSINESSES, // Stay on businesses page
    };
    
    if (routeMap[view]) {
      navigate(routeMap[view]);
    }
  };

  // Get user data based on role
  const userData = role === 'business' 
    ? { name: mockBusinessOwner.businessName, email: mockBusinessOwner.businessEmail }
    : { name: mockUser.name, email: mockUser.email };

  return (
    <>
      <AppSidebar
        onNavigate={handleNavigate}
        onLogout={logout}
        currentView={getCurrentView()}
        userName={userData.name}
        userEmail={userData.email}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
      />
      <div className="ml-20">
        <Outlet />
      </div>
    </>
  );
};