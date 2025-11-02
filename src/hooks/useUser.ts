// hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react';
import { User, UserStats } from '../types/user';
import { BusinessOwner, MOCK_BUSINESS_OWNERS } from '../data/mockBusinessOwnerData';

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
};

const MOCK_STATS: Record<string, UserStats> = {
  'user-1': {
    vouchersCount: 5,
    reviewsCount: 12,
    loyaltyPoints: 3500,
  },
};

export const useUser = (userId: string | null) => {
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
    
    // ✅ Check if it's a business user
    if (userId.startsWith('business-')) {
      const businessData = MOCK_BUSINESS_OWNERS[userId];
      setUser(businessData || null);
    } else {
      // ✅ Try to find user in MOCK_USERS
      let userData = MOCK_USERS[userId];
      
      // ✅ If not found, create a default user (for new signups)
      if (!userData) {
        userData = {
          id: userId,
          role: 'user',
          name: 'New User',
          email: 'user@email.com',
          memberSince: new Date().toISOString().split('T')[0],
          bio: '',
          location: 'Singapore',
        };
        // Store it in mock data
        MOCK_USERS[userId] = userData;
      }
      
      setUser(userData);
    }
    
    setStats(MOCK_STATS[userId] || { vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
  }, [userId]);

  const updateUser = useCallback((updatedUser: User | BusinessOwner) => {
    console.log('🔄 updateUser called:', updatedUser);
    
    if ('businessName' in updatedUser) {
      MOCK_BUSINESS_OWNERS[updatedUser.id] = updatedUser as BusinessOwner;
    } else {
      MOCK_USERS[updatedUser.id] = updatedUser as User;
    }
    
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
