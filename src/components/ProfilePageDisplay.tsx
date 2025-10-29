import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useTheme } from '../hooks/useTheme';
import { ProfilePage } from './pages/ProfilePage';
import { ROUTES } from '../constants/routes';
import { Business } from '../types/business';
import { useState, useEffect } from 'react';
import { useUserPointsStore } from '../store/userStore';

const MOCK_BOOKMARKED_BUSINESSES: Business[] = [];

export function ProfilePageDisplay() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { isDarkMode } = useTheme();
  const { setPoints } = useUserPointsStore(); // ✅ Correct
  const [bookmarkedBusinesses] = useState<Business[]>(MOCK_BOOKMARKED_BUSINESSES);

  // Call useUser hook unconditionally (pass null if userId doesn't exist)
  const { user, stats, updateUser } = useUser(userId);

  // Sync loyalty points with user points store
  useEffect(() => {
    if (stats?.loyaltyPoints !== undefined) {
      setPoints(stats.loyaltyPoints); // ✅ Correct
    }
  }, [stats?.loyaltyPoints, setPoints]);

  // Navigation handlers
  const handleBack = () => navigate(ROUTES.BUSINESSES);
  const handleViewBusinessDetails = (business: Business) => navigate(`${ROUTES.BUSINESSES}/${business.id}`);
  const handleBookmarkToggle = (businessId: string) => console.log('Toggle bookmark for:', businessId);
  const handleNavigateToVouchers = () => navigate(ROUTES.VOUCHERS);

  // Loading state - show if no userId or no user data yet
  if (!userId || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}>
        <div style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <ProfilePage
      user={user}
      stats={stats}
      bookmarkedBusinesses={bookmarkedBusinesses}
      onBack={handleBack}
      onUpdateUser={updateUser}
      onViewBusinessDetails={handleViewBusinessDetails}
      onBookmarkToggle={handleBookmarkToggle}
      onNavigateToVouchers={handleNavigateToVouchers}
      isDarkMode={isDarkMode}
    />
  );
}
