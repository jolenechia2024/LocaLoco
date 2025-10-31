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
    console.log('🔍 useUser - userId:', userId); // Debug log
    
    if (!userId) {
      setUser(null);
      setStats({ vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
      return;
    }
    
    // ✅ Check if it's a business user
    if (userId.startsWith('business-')) {
      const businessData = MOCK_BUSINESS_OWNERS[userId];
      console.log('🏢 useUser - Loading business data:', businessData); // Debug log
      setUser(businessData || null);
    } else {
      const userData = MOCK_USERS[userId];
      console.log('👤 useUser - Loading user data:', userData); // Debug log
      setUser(userData || null);
    }
    
    setStats(MOCK_STATS[userId] || { vouchersCount: 0, reviewsCount: 0, loyaltyPoints: 0 });
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
