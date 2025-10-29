// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;  // optional profile image URL
  memberSince?: string;
  bio?: string;
  location?: string;
}

export interface UserStats {
  vouchersCount: number;
  reviewsCount: number;
  loyaltyPoints: number;
}
