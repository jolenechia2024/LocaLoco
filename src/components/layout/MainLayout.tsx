import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '../AppSidebar';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { ROUTES } from '../../constants/routes';

export const MainLayout = () => {
  const { logout, userId } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const { user, stats, updateUser } = useUser(userId || null);

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
      profile: user && 'businessName' in user ? ROUTES.BUSINESS_PROFILE : ROUTES.PROFILE, // ✅ Check if BusinessOwner
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}>
        <div style={{ color: isDarkMode ? '#fff' : '#000' }}>Loading user data...</div>
      </div>
    );
  }

  // ✅ Helper function to safely get user info
  const getUserInfo = () => {
    if ('businessName' in user) {
      // It's a BusinessOwner
      return {
        name: user.businessName,
        email: user.businessEmail,
        avatarUrl: user.wallpaper,
      };
    } else {
      // It's a regular User
      return {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      };
    }
  };

  const userInfo = getUserInfo();

  return (
    <>
      <AppSidebar
        onNavigate={handleNavigate}
        onLogout={logout}
        currentView={getCurrentView()}
        userName={userInfo.name} // ✅ Use helper
        userEmail={userInfo.email} // ✅ Use helper
        avatarUrl={userInfo.avatarUrl} // ✅ Use helper
        onThemeToggle={toggleTheme}
      />
      <div className="ml-20">
        <Outlet context={{ user, stats, updateUser }} />
      </div>

    </>
  );
};
