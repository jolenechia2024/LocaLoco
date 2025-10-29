export interface BusinessOwner {
  id: string;
  businessName: string;
  role: 'business'; // ✅ Add this
  address: string;
  operatingDays: string[];
  businessEmail: string;
  phone: string;
  website: string;
  socialMedia: string;
  wallpaper?: string;
  priceTier: '$' | '$$' | '$$$' | '$$$$';
  offersDelivery: boolean;
  offersPickup: boolean;
  paymentOptions: string[];
  category: string;
  description: string;
}

export const mockBusinessOwner: BusinessOwner = {
  id: 'business-1',
  role: 'business', // ✅ Add this
  businessName: 'The Local Cafe',
  address: '123 Main Street, Singapore 123456',
  operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  businessEmail: 'contact@localcafe.com',
  phone: '+65 1234 5678',
  website: 'https://www.localcafe.com',
  socialMedia: 'https://instagram.com/localcafe',
  wallpaper: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  priceTier: '$$',
  offersDelivery: true,
  offersPickup: true,
  paymentOptions: ['Cash', 'Credit/Debit Card', 'PayNow', 'Digital Wallets (Apple/Google/Samsung/GrabPay)'],
  category: 'fnb',
  description: 'A cozy local cafe serving artisan coffee and fresh pastries',
};
