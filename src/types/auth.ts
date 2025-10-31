// src/types/auth.ts

export type UserRole = 'user' | 'business';

import { BusinessOwner } from '../data/mockBusinessOwnerData';

export type { BusinessOwner } from '../data/mockBusinessOwnerData';

export type UserProfile = User | BusinessOwner;

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
}

// ✅ Add this User interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole; // This is the property that was missing!
  // Add any other user properties you need
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BusinessSignupData extends SignupData {
  businessName: string;
  address: string;
  phone: string;
}

export interface BusinessVerificationData {
  // From BusinessSignup page
  uen: string;
  businessName: string;
  businessCategory: string;
  description: string;
  address: string;
  open247: boolean;

  // From BusinessVerification page
  operatingDays: string[];
  businessEmail: string;
  phone: string;
  website: string;
  socialMedia: string;
  wallpaper?: File | null;
  priceTier: '$' | '$$' | '$$$' | '$$$$' | '';
  offersDelivery: boolean;
  offersPickup: boolean;
  paymentOptions: string[];

  // Auto-generated
  dateOfCreation?: string;
}
