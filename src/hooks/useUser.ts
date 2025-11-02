// hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react';
import { User, UserStats } from '../types/user';
import { BusinessOwner, MOCK_BUSINESS_OWNERS } from '../data/mockBusinessOwnerData'; // ✅ Import these

const MOCK_USERS: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    role: 'user',
    name: 'John Tan',
    email: 'john.tan@email.com',
    memberSince: '2024-01-15',
    bio: 'Food enthusiast and local business supporter',
    location: 'Singapore',
  },
  // Remove business-1 from here since it should come from MOCK_BUSINESS_OWNERS
};

const MOCK_STATS: Record<string, UserStats> = {
  'user-1': {
    vouchersCount: 5,
    reviewsCount: 12,
    loyaltyPoints: 3500,
  },
  'business-1': {
    vouchersCount: 0,
    reviewsCount: 0,
    loyaltyPoints: 0,
  },
};

export const useUser = (userId: string | null) => {
  // ✅ Change type to support both User and BusinessOwner
  const [user, setUser] = useState<User | BusinessOwner | null>(null);
  const [stats, setStats] = useState<UserStats>({
    vouchersCount: 0,
    reviewsCount: 0,
    loyaltyPoints: 0,
  });

  useEffect(() => {
    console.log('🔍 useUser - userId:', userId);

    if (!userId) {
      setUser(null);
      setStats({ vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
      return;
    }

    // Fetch real user data from backend
    const fetchUserData = async () => {
      try {
        console.log('🌐 Fetching user data for userId:', userId);
        // Call your backend API to get user data
        const response = await fetch(`http://localhost:3000/api/users/profile/${userId}`);

        console.log('📡 Response status:', response.status, response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        console.log('👤 useUser - Fetched user data from DB:', userData);

        // Transform backend data to match frontend User type
        const user: User = {
          id: userData.id,
          role: 'user',
          name: userData.name || 'User',
          email: userData.email,
          memberSince: userData.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          bio: userData.bio || '',
          location: userData.location || 'Singapore',
        };

        setUser(user);

        // TODO: Fetch real stats from backend
        setStats(MOCK_STATS[userId] || { vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });

      } catch (error) {
        console.error('❌ Error fetching user data:', error);

        // Fallback to creating a basic user object if API fails
        const fallbackUser: User = {
          id: userId,
          role: 'user',
          name: 'User',
          email: 'user@example.com',
          memberSince: new Date().toISOString().split('T')[0],
          bio: '',
          location: 'Singapore',
        };
        setUser(fallbackUser);
        setStats({ vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
      }
    };

    fetchUserData();
  }, [userId]);

  const updateUser = useCallback((updatedUser: User | BusinessOwner) => {
    console.log('🔄 updateUser called:', updatedUser);
    
    // ✅ Update the correct mock database based on type
    if ('businessName' in updatedUser) {
      // It's a BusinessOwner
      MOCK_BUSINESS_OWNERS[updatedUser.id] = updatedUser as BusinessOwner;
    } else {
      // It's a regular User
      MOCK_USERS[updatedUser.id] = updatedUser as User;
    }
    
    // Force state update with completely new object
    if (updatedUser.id === userId) {
      setUser(() => {
        const newUser = { ...updatedUser };
        console.log('✅ State updated with:', newUser);
        return newUser;
      });
    }
  }, [userId]);

  return { user, stats, updateUser };
};
