import { useState, useEffect, useCallback } from 'react';
import { User, UserStats } from '../types/user';
import { BusinessOwner } from '../data/mockBusinessOwnerData';

const API_BASE_URL = 'http://localhost:3000'; // Adjust to your backend port

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
<<<<<<< HEAD
=======
    console.log('🔍 useUser - userId:', userId);

>>>>>>> bc4734c (1. Fixed the linking up username with creating forum posts/replies)
    if (!userId) {
      setUser(null);
      setStats({ vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
      return;
    }

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
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ User profile fetched:', data);

        // Map the API response to your User type
        const userData: User = {
          id: data.profile.id,
          role: 'user',
          name: data.profile.name,
          email: data.profile.email,
          memberSince: data.profile.createdAt?.split('T')[0] || '',
          bio: '', // Add if your schema has this
          location: '', // Add if your schema has this
        };

        setUser(userData);

        // Set stats based on vouchers count
        setStats({
          vouchersCount: data.vouchers?.length || 0,
          reviewsCount: 0, // You may need another API call for reviews
          loyaltyPoints: 0, // Add if you have loyalty points logic
        });
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
        setLoading(false);
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
      console.log('🔄 updateUser called:', updatedUser);

      try {
        // ✅ Determine user type
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

      setUser(() => {
        const newUser = { ...updatedUser };
        console.log('✅ State updated with:', newUser);
        return newUser;
      });
    } catch (err) {
      console.error('❌ Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }, [userId]);

  return { user, stats, updateUser, loading, error };
};
