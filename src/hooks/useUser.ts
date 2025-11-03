import { useState, useEffect, useCallback } from 'react';
import { User, UserStats } from '../types/user';
import { BusinessOwner } from '../data/mockBusinessOwnerData';

const API_BASE_URL = 'http://localhost:3000';

export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({
    vouchersCount: 0,
    reviewsCount: 0,
    loyaltyPoints: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setStats({ vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
      return;
    }
    let isMounted = true;
    let timeoutId: number | undefined = undefined;

    const fetchUserProfile = async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        console.log('🌐 Fetching user profile for userId:', userId);

        const response = await fetch(`${API_BASE_URL}/api/users/profile/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: signal, // Pass abort signal to fetch
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }
        const profileData = data.profile || data;
        if (!profileData || !profileData.id) {
          throw new Error('Invalid API response: missing user id');
        }
        const userData: User = {
          id: data.profile.id,
          role: 'user',
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
        if (isMounted) {
          setUser(userData);
          setStats({
            vouchersCount: data.vouchers?.length || 0,
            reviewsCount: data.reviews?.length || 0,
            loyaltyPoints: profileData.loyaltyPoints || 0,
          });
        }
      } catch (err) {
        // Ignore abort errors (happens during logout/unmount)
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('🛑 Fetch aborted (user logged out or component unmounted)');
          return;
        }

        console.error('❌ Error fetching user profile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUser(null); // Clear user on error instead of creating fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Add abort controller to cancel fetch on unmount/logout
    const controller = new AbortController();
    fetchUserProfile(controller.signal);

    // Cleanup function to abort fetch if component unmounts or userId changes
    return () => {
      controller.abort();
    };
  }, [userId]);

  const updateUser = useCallback(
    async (updatedUser: User | BusinessOwner) => {
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
        setUser({ ...updatedUser });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
      }
    },
    []
  );

  return { user, stats, updateUser, loading, error };
};
