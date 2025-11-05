// hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react';
import { User, UserStats } from '../types/user';
import { BusinessOwner } from '../types/auth.store.types';

const API_BASE_URL = 'http://localhost:3000';

export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<User | BusinessOwner | null>(null);
  const [stats, setStats] = useState<UserStats>({
    vouchersCount: 0,
    reviewsCount: 0,
    loyaltyPoints: 0,
  });
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The fetch logic is wrapped in useCallback to keep its reference stable
  const fetchUserProfile = useCallback(async (signal?: AbortSignal) => {
    if (!userId) {
      setUser(null);
      setStats({ vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
      setVouchers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const data = await response.json();
      
      const profileData = data.profile;
      const statsData = data.stats;

      if (!profileData || !profileData.id) {
        throw new Error('Invalid API response: missing profile data');
      }

      const userData: User = {
        id: profileData.id,
        role: 'user', // This might need to come from the API
        name: profileData.name || 'User',
        email: profileData.email || 'user@email.com',
        avatarUrl: profileData.image || undefined,
        memberSince: profileData.createdAt ? profileData.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        bio: profileData.bio || '',
        location: profileData.location || 'Singapore',
      };

      setUser(userData);
      
      // Set stats directly from the API response
      setStats({
        vouchersCount: statsData?.vouchersCount || 0,
        reviewsCount: statsData?.reviewsCount || 0,
        loyaltyPoints: statsData?.loyaltyPoints || 0,
      });
      
      setVouchers(data.vouchers || []);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors silently
      }
      console.error('❌ Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // This effect runs on mount and whenever fetchUserProfile changes
  useEffect(() => {
    const controller = new AbortController();
    fetchUserProfile(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchUserProfile]);

  // The "mutate" function is an alias for our stable fetch function.
  const mutate = fetchUserProfile;

  const updateUser = useCallback(
    async (updatedUser: User | BusinessOwner) => {
      console.log('🔄 updateUser called:', updatedUser);

      try {
        const isBusinessOwner = 'businessName' in updatedUser;
        const userName = isBusinessOwner 
          ? (updatedUser as BusinessOwner).businessName 
          : (updatedUser as User).name;

        const response = await fetch(`${API_BASE_URL}/api/user/update-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            userId: updatedUser.id,
            name: userName,
            image: 'image' in updatedUser ? updatedUser.image : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update user profile');
        }

        const data = await response.json();
        console.log('✅ Profile updated:', data);

        setUser({ ...updatedUser });
        
      } catch (err) {
        console.error('❌ Error updating user:', err);
        setError(err instanceof Error ? err.message : 'Update failed');
      }
    },
    []
  );

  // ✅ FIX: The `mutate` function is now included in the return object.
  return { user, stats, vouchers, updateUser, loading, error, mutate };
};
