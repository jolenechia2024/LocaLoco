// hooks/useUser.ts
import { useMemo } from 'react';
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
    
  const user = useMemo(() => {
    if (!userId) return null;
    return MOCK_USERS[userId] || null;
  }, [userId]);

  console.log('Loaded user:', user);

  const stats = useMemo(() => {
    if (!userId) return { vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 };
    return MOCK_STATS[userId] || { vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 };
  }, [userId]);

  const updateUser = (updatedUser: User) => {
    MOCK_USERS[updatedUser.id] = updatedUser;
  };

  return { user, stats, updateUser };
};