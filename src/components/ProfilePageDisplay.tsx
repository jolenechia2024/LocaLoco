import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useTheme } from '../hooks/useTheme';
import { ProfilePage } from './pages/ProfilePage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { ROUTES } from '../constants/routes';
import { Business } from '../types/business';
import { BusinessOwner } from '../data/mockBusinessOwnerData'; // ✅ Import BusinessOwner
import { useState, useEffect } from 'react';
import { useUserPointsStore } from '../store/userStore';

const MOCK_BOOKMARKED_BUSINESSES: Business[] = [];

export function ProfilePageDisplay() {
  const navigate = useNavigate();
  const { userId, role } = useAuth(); // ✅ Get role from useAuth
  const { isDarkMode } = useTheme();
  const setCurrentPoints = useUserPointsStore(state => state.setCurrentPoints);
  const [bookmarkedBusinesses] = useState<Business[]>(MOCK_BOOKMARKED_BUSINESSES);

  // Call useUser hook unconditionally
  const { user, stats, updateUser } = useUser(userId);

  // ✅ DEBUG LOGS
  console.log('════════════════════════════════════');
  console.log('📊 ProfilePageDisplay Debug Info:');
  console.log('userId:', userId);
  console.log('role:', role);
  console.log('user:', user);
  console.log('user type check:');
  console.log('  - has businessName?', user && 'businessName' in user);
  console.log('  - has name?', user && 'name' in user);
  console.log('  - has phone?', user && 'phone' in user);
  console.log('  - has operatingDays?', user && 'operatingDays' in user);
  console.log('════════════════════════════════════');

  // Sync loyalty points with user points store
  useEffect(() => {
    if (stats?.loyaltyPoints !== undefined) {
      setCurrentPoints(stats.loyaltyPoints);
    }
  }, [stats?.loyaltyPoints, setCurrentPoints]);

  // Navigation handlers
  const handleBack = () => navigate(ROUTES.BUSINESSES);
  const handleViewBusinessDetails = (business: Business) => navigate(`${ROUTES.BUSINESSES}/${business.id}`);
  const handleBookmarkToggle = (businessId: string) => console.log('Toggle bookmark for:', businessId);
  const handleNavigateToVouchers = () => navigate(ROUTES.VOUCHERS);

  // Loading state - show if no userId or no user data yet
  if (!userId || !user) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}>
        <div style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>Loading profile...</div>
      </div>
    );
  }

  // ✅ Check if user is a business owner using role from useAuth AND type guard
  if (role === 'business' && 'businessName' in user) {
    console.log('🏢 Rendering BusinessProfilePage');
    console.log('🏢 Business data being passed:', user);
    
    return (
      <BusinessProfilePage
        businessOwner={user as BusinessOwner}
        onBack={handleBack}
        onUpdateBusiness={updateUser}
        isDarkMode={isDarkMode}
      />
    );
  }

  // ✅ Error case: role is business but data is wrong
  if (role === 'business' && !('businessName' in user)) {
    console.error('❌ ERROR: role is business but user data missing businessName!');
    console.error('User data received:', user);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}>
        <div style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
          <h2 className="text-xl mb-4">Profile Data Error</h2>
          <p>Business profile data not loaded correctly.</p>
          <pre className="mt-4 text-xs">{JSON.stringify({ userId, role, user }, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // ✅ Regular user profile
  console.log('👤 Rendering regular ProfilePage');
  return (
    <ProfilePage
      user={user as any}
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
