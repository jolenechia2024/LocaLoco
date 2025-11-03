// hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
// shallow is no longer needed
import { User, UserStats } from '../types/user';
import { BusinessOwner } from '../data/mockBusinessOwnerData';

const API_BASE_URL = 'http://localhost:3000'; 

export const useUser = () => {
  // ✅ Use a separate selector for each piece of state. This is the most robust pattern.
  const userId = useAuthStore((state) => state.userId);
  const refetchCounter = useAuthStore((state) => state.refetchCounter);
  
  const [user, setUser] = useState<User | BusinessOwner | null>(null);
  const [stats, setStats] = useState<UserStats>({
    vouchersCount: 0,
    reviewsCount: 0,
    loyaltyPoints: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 useUser hook triggered by:', { userId, refetchCounter });

    if (!userId) {
      setUser(null);
      setStats({ vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
      return;
    }

    const fetchUserProfile = async (signal: AbortSignal) => {
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
        const profileData = data.profile || data;

        if (!profileData || !profileData.id) {
          throw new Error('Invalid API response: missing user id');
        }

        const userData: User = {
          id: profileData.id,
          role: profileData.has_business ? 'business' : 'user',
          name: profileData.name || 'User',
          email: profileData.email || 'user@email.com',
          avatarUrl: profileData.image || undefined,
          memberSince: profileData.createdAt
            ? profileData.createdAt.split('T')[0]
            : new Date().toISOString().split('T')[0],
          bio: profileData.bio || '',
          location: profileData.location || 'Singapore',
          hasBusiness: profileData.hasBusiness || false, // ✅ Map the value here
        };

        setUser(userData);

        setStats({
          vouchersCount: data.vouchers?.length || 0,
          reviewsCount: data.reviews?.length || 0,
          loyaltyPoints: data.points || 0,
        });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('❌ Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const controller = new AbortController();
    fetchUserProfile(controller.signal);

    return () => {
      controller.abort();
    };
  }, [userId, refetchCounter]);

  const updateUser = useCallback(
    async (updatedUser: User | BusinessOwner) => {
        try {
            const isBusinessOwner = 'businessName' in updatedUser;
            const userName = isBusinessOwner 
              ? (updatedUser as BusinessOwner).businessName 
              : (updatedUser as User).name;

            await fetch(`${API_BASE_URL}/api/user/update-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: updatedUser.id,
                    name: userName,
                    image: 'image' in updatedUser ? updatedUser.image : undefined,
                }),
            });

            setUser((prevUser) => ({ ...prevUser, ...updatedUser } as User | BusinessOwner));
        } catch (err) {
            console.error('❌ Error updating user:', err);
            setError(err instanceof Error ? err.message : 'Update failed');
        }
    },
    []
  );

  return { user, stats, updateUser, loading, error };
};
