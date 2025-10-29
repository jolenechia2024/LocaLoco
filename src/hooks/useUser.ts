import { useState, useEffect, useCallback } from 'react';
import { User, UserStats } from '../types/user';

const MOCK_USERS: Record<string, User> = {
  'customer-1': {
    id: 'customer-1',
    name: 'John Tan',
    email: 'john.tan@email.com',
    memberSince: '2024-01-15',
    bio: 'Food enthusiast and local business supporter',
    location: 'Singapore',
  },
  'business-1': {
    id: 'business-1',
    name: 'Jane Smith',
    email: 'jane@business.com',
    memberSince: '2023-06-20',
    bio: 'Restaurant owner',
    location: 'Singapore',
  },
};

const MOCK_STATS: Record<string, UserStats> = {
  'customer-1': {
    vouchersCount: 5,
    reviewsCount: 12,
    loyaltyPoints: 350,
  },
  'business-1': {
    vouchersCount: 0,
    reviewsCount: 0,
    loyaltyPoints: 0,
  },
};

export const useUser = (userId: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({
    vouchersCount: 0,
    reviewsCount: 0,
    loyaltyPoints: 0,
  });

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setStats({ vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
      return;
    }
    setUser(MOCK_USERS[userId] || null);
    setStats(MOCK_STATS[userId] || { vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
  }, [userId]);

  const updateUser = useCallback((updatedUser: User) => {
    console.log('🔄 updateUser called:', updatedUser);
    
    // Update mock database
    MOCK_USERS[updatedUser.id] = updatedUser;
    
    // Force state update with completely new object
    if (updatedUser.id === userId) {
      // Use functional update to ensure latest state
      setUser(() => {
        const newUser = { ...updatedUser };
        console.log('✅ State updated with:', newUser);
        return newUser;
      });
    }
  }, [userId]);

  return { user, stats, updateUser };
};
