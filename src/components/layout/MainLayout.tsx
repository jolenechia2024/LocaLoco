import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../AppSidebar';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { ROUTES } from '../../constants/routes';
import { useMemo } from 'react';

export const MainLayout = () => {
  const { logout, userId } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const { user, stats, updateUser } = useUser(userId || null);

  // Create stable key BEFORE any conditional returns
  const userKey = useMemo(
    () => user ? `${user.name}-${user.email}-${user.avatarUrl || 'default'}` : 'no-user',
    [user?.name, user?.email, user?.avatarUrl]
  );

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
      filters: ROUTES.BUSINESSES,
    };
    if (routeMap[view]) {
      navigate(routeMap[view]);
    }
  };

  // NOW it's safe to do conditional return
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}>
        <div style={{ color: isDarkMode ? '#fff' : '#000' }}>Loading user data...</div>
      </div>
    );
  }

  console.log('MainLayout rendering with userKey:', userKey);

  return (
    <>
      <AppSidebar
        key={userKey}
        onNavigate={handleNavigate}
        onLogout={logout}
        currentView={getCurrentView()}
        userName={user.name}
        userEmail={user.email}
        avatarUrl={user.avatarUrl}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
      />
      <div className="ml-20">
        <Outlet context={{ user, stats, updateUser }} />
      </div>
    </>
  );
};
