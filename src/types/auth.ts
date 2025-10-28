export type UserRole = 'user' | 'business';

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
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
}
