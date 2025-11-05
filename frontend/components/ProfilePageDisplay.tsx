import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../hooks/useUser';
import { useTheme } from '../hooks/useTheme';
import { useBusinessByUen } from '../hooks/useBusinessByUen';
import { useAuthStore } from '../store/authStore';
import { ProfilePage } from './pages/ProfilePage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { ROUTES } from '../constants/routes';
import { Business, BusinessOwner } from '../types/business';
import { useState, useEffect } from 'react';
import { useUserPointsStore } from '../store/userStore';
import { toast } from 'sonner'; // 1. Import toast
import { BusinessVerificationData } from '../types/auth.store.types'; // 2. Import the type

// In ProfilePageDisplay.tsx

const API_BASE_URL = 'http://localhost:3000';

// ✅ COPIED FROM YOUR SIGNUP PAGE LOGIC
const uploadWallpaper = async (file: File): Promise<string> => {
    const toastId = toast.loading('Uploading image...');
    
    try {
      // Step 1: Get the secure upload URL from your backend
      const sasResponse = await fetch(
        `${API_BASE_URL}/api/url-generator?filename=${encodeURIComponent(file.name)}`
      );
      
      if (!sasResponse.ok) {
        throw new Error('Failed to generate upload URL');
      }

      const sasData = await sasResponse.json();
      
      // Step 2: Upload the file directly to Azure Blob Storage
      const uploadResponse = await fetch(sasData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-ms-blob-type': 'BlockBlob'
        },
        body: file
      });

      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed with status ${uploadResponse.status}`);
      }

      // Step 3: Return the final, permanent URL of the image
      const wallpaperUrl = `https://localoco.blob.core.windows.net/images/${sasData.blobName}`;
      toast.success('Image uploaded successfully!', { id: toastId });
      return wallpaperUrl;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(`Upload error: ${errorMessage}`, { id: toastId });
      throw error;
    }
  };


const MOCK_BOOKMARKED_BUSINESSES: Business[] = [];

export function ProfilePageDisplay() {
  const navigate = useNavigate();
  const { userId, role } = useAuth(); // ✅ Get role from useAuth
  const { isDarkMode } = useTheme();
  const { setPoints } = useUserPointsStore(); // ✅ Correct
  const [bookmarkedBusinesses] = useState<Business[]>(MOCK_BOOKMARKED_BUSINESSES);

  // Get business mode state
  const businessMode = useAuthStore((state) => state.businessMode);
  const enableBusinessMode = useAuthStore((state) => state.enableBusinessMode);


  // Call useUser hook unconditionally for user data
  const { user, stats, updateUser, mutate: mutateUser } = useUser(userId);


  // Fetch business data when in business mode
  const { business, loading: businessLoading } = useBusinessByUen(
    businessMode.isBusinessMode ? businessMode.currentBusinessUen : null
  );



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
      setPoints(stats.loyaltyPoints); // ✅ Correct
    }
  }, [stats?.loyaltyPoints, setPoints]);

  const API_BASE_URL = 'http://localhost:3000'; // Define your API base URL


  const handleAddBusiness = async (data: BusinessVerificationData) => {
    // Note: The second 'userId' argument is no longer needed here as it's already in scope.
    const toastId = toast.loading('Registering your business...');
    
    try {
      let wallpaperUrl = '';

      // 1. Check if a wallpaper file exists and upload it
      if (data.wallpaper && data.wallpaper instanceof File) {
        wallpaperUrl = await uploadWallpaper(data.wallpaper);
      }

      const priceTierMap: Record<string, 'low' | 'medium' | 'high'> = {
        '$': 'low',
        '$$': 'medium',
        '$$$': 'high',
      };
      
      // 2. Prepare the final payload with the URL, not the File object
      const payload = {
        ...data,
        uen: data.uen ?? '',
        businessName: data.businessName ?? '',
        businessCategory: data.businessCategory ?? '',
        description: data.description ?? '',
        address: data.address ?? '',
        email: data.email ?? '',
        phoneNumber: data.phoneNumber ?? '',
        websiteLink: data.websiteLink ?? '',
        socialMediaLink: data.socialMediaLink ?? '',
        wallpaper: wallpaperUrl || '',
        dateOfCreation: data.dateOfCreation ?? null,
        priceTier: priceTierMap[data.priceTier] || 'medium',
        offersDelivery: data.offersDelivery ? 1 : 0,
        offersPickup: data.offersPickup ? 1 : 0,
        ownerId: userId,
        latitude: 0,
        longitude: 0,
        open247: data.open247 ? 1 : 0,
      };
      delete (payload as any).website;
      delete (payload as any).socialMedia;

      console.log(payload);
      // 3. Send the corrected payload to your registration endpoint
      const response = await fetch(`${API_BASE_URL}/api/register-business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register business');
      }

      const newBusiness = await response.json();
      
      if (newBusiness && newBusiness.uen && newBusiness.businessName) {
        enableBusinessMode(newBusiness.uen, newBusiness.businessName);
        await mutateUser();
        toast.success('Business registered successfully! Switching to Business Mode.', { id: toastId });
      } else {
        throw new Error('API did not return valid business data.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      toast.error(`Registration failed: ${errorMessage}`, { id: toastId });
    }
  };

  // Navigation handlers
  const handleBack = () => navigate(ROUTES.BUSINESSES);
  const handleViewBusinessDetails = (business: Business) => navigate(`${ROUTES.BUSINESSES}/${business.uen}`);
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

  // ✅ Check if in business mode - fetch and show business profile
  if (role === 'business' && businessMode.isBusinessMode) {
    console.log('🏢 Business mode active');
    console.log('🏢 Current business UEN:', businessMode.currentBusinessUen);
    console.log('🏢 Business data:', business);

    // Show loading while fetching business data
    if (businessLoading || !business) {
      console.log('⏳ Loading business data...');
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: isDarkMode ? '#3a3a3a' : '#f9fafb' }}>
          <div style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>Loading business profile...</div>
        </div>
      );
    }

    // Convert business data to BusinessOwner format
    const businessOwner: BusinessOwner = {
      id: userId || '',
      role: 'business_owner',
      businessName: business.name, // Use 'name' from Business type
      address: business.address || '',
      operatingDays: Object.keys(business.hours || {}), // Use 'hours' from Business type
      businessEmail: business.email || '',
      phone: business.phone || '',
      website: business.website || '',
      socialMedia: business.socialMedia || '',
      wallpaper: business.image, // Use 'image' from Business type
      priceTier: (business.priceRange || '') as '' | '$' | '$$' | '$$$' | '$$$$',
      offersDelivery: business.offersDelivery || false,
      offersPickup: business.offersPickup || false,
      paymentOptions: business.paymentOptions || [],
      category: business.category || '',
      description: business.description || '',
    };

    console.log('🏢 Rendering BusinessProfilePage with:', businessOwner);

    return (
      <BusinessProfilePage
        businessOwner={businessOwner}
        onBack={handleBack}
        onUpdateBusiness={updateUser}
      />
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
      onAddBusiness={handleAddBusiness}
    />
  );
}
