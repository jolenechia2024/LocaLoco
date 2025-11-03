// 📍 src/components/ProfilePageDisplay.tsx

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useTheme } from '../hooks/useTheme';
import { ProfilePage } from './pages/ProfilePage';
import { ROUTES } from '../constants/routes';
import { Business } from '../types/business';
import { BusinessOwner } from '../data/mockBusinessOwnerData';
import { useState, useEffect } from 'react';
import { useUserPointsStore } from '../store/userStore';
import { RedeemedVoucher } from '../types/vouchers'; // ✅ Import RedeemedVoucher type


const MOCK_BOOKMARKED_BUSINESSES: Business[] = [];

export function ProfilePageDisplay() {
  const navigate = useNavigate();
  const { userId, role } = useAuth();
  const { isDarkMode } = useTheme();
  const { setPoints } = useUserPointsStore();
  const [bookmarkedBusinesses] = useState<Business[]>(MOCK_BOOKMARKED_BUSINESSES);

  // 1. CATCH the new 'vouchers' variable from the useUser hook
  const { user, stats, vouchers, updateUser } = useUser(userId);

  // ✅ DEBUG LOGS
  console.log('════════════════════════════════════');
  console.log('📊 ProfilePageDisplay Debug Info:');
  console.log('userId:', userId);
  console.log('role:', role);
  console.log('user:', user);
  console.log('vouchers count:', vouchers?.length); // Debug the count
  console.log('════════════════════════════════════');

  // Sync loyalty points with user points store
  useEffect(() => {
    if (stats?.loyaltyPoints !== undefined) {
      setPoints(stats.loyaltyPoints);
    }
  }, [stats?.loyaltyPoints, setPoints]);

  // Navigation handlers
  const handleBack = () => navigate(ROUTES.BUSINESSES);
  const handleViewBusinessDetails = (business: Business) => navigate(`${ROUTES.BUSINESSES}/${business.uen}`);
  const handleBookmarkToggle = (businessId: string) => console.log('Toggle bookmark for:', businessId);
  const handleNavigateToVouchers = () => navigate(ROUTES.VOUCHERS);

  // Loading state - now checking for vouchers data too
  if (!userId || !user || !vouchers) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}>
        <div style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>Loading profile...</div>
      </div>
    );
  }

  // Business profile logic (unchanged)
  if (role === 'business' && 'businessName' in user) {
    console.log('🏢 Rendering BusinessProfilePage');
    
    return (
      <BusinessProfilePage
        businessOwner={user as BusinessOwner}
        onBack={handleBack}
        onUpdateBusiness={updateUser}
      />
    );
  }

  // Error case (unchanged)
  if (role === 'business' && !('businessName' in user)) {
    console.error('❌ ERROR: role is business but user data missing businessName!');
    // ... (Error display code) ...
  }

  // ✅ Regular user profile
  console.log('👤 Rendering regular ProfilePage');
  return (
    <ProfilePage
      user={user}
      stats={stats}
      vouchers={vouchers as RedeemedVoucher[]} // 2. PASS the full voucher list here
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