export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  memberSince: string;
  bio?: string;
  location?: string;
}

export interface UserStats {
  vouchersCount: number;
  reviewsCount: number;
  loyaltyPoints: number;
}
