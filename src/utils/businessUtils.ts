import { Business, OpenStatus, BusinessCategory } from '../types/business';

// Transform backend business data shape into frontend Business interface
export interface BackendBusiness {
  uen: string;
  businessName: string;
  businessCategory: string;
  description: string;
  address: string;
  phoneNumber: string;
  websiteLink?: string;
  wallpaper: string;
  priceTier: string;
  openingHours: {
    [day: string]: {
      open: string;
      close: string;
    };
  };
  offersDelivery?: boolean;
  offersPickup?: boolean;
  paymentOptions?: string[];
}

// Map backend category to frontend BusinessCategory
const categoryMap: Record<string, BusinessCategory> = {
  'all': 'all',
  'fnb': 'fnb',
  'dietary-options': 'dietary-options',
  'retail': 'retail',
  'services': 'services',
  'entertainment': 'entertainment',
  'health_wellness': 'health-wellness', // maps underscore to dash
  'professional-services': 'professional-services',
  'home-living': 'home-living',
};

// Map backend priceTier to frontend priceRange
const priceTierMap: Record<string, Business['priceRange']> = {
  'low': 'low',
  'medium': 'medium',
  'high': 'high',
};

/**
 * Transform raw backend business data to frontend Business interface
 */
export function transformBackendToBusiness(backend: BackendBusiness): Business {
  return {
    id: backend.uen,
    name: backend.businessName,
    category: categoryMap[backend.businessCategory] || 'services', // fallback category
    description: backend.description,
    address: backend.address,
    phone: backend.phoneNumber,
    website: backend.websiteLink,
    image: backend.wallpaper,
    priceRange: priceTierMap[backend.priceTier] || 'medium',
    hours: backend.openingHours,
    offersDelivery: backend.offersDelivery,
    offersPickup: backend.offersPickup,
    paymentOptions: backend.paymentOptions,
    rating: 0, // default or map if data available
    reviewCount: 0,
    coordinates: undefined, // supply if available
  };
}


export const getCategoryDisplayName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'all': 'All Categories',
    'fnb': 'Food & Beverage',
    'dietary-options': 'Dietary Options',
    'retail': 'Retail',
    'services': 'Services',
    'entertainment': 'Entertainment',
    'health-wellness': 'Health & Wellness',
    'professional-services': 'Professional Services',
    'home-living': 'Home & Living'
  };
  return categoryMap[category] || category;
};


/**
 * Checks if a business is currently open based on local time and hours object.
 * Expects business.hours in format:
 * {
 *   Monday: { open: "07:00:00", close: "19:00:00" },
 *   ...
 * }
 */
export const checkBusinessOpenStatus = (business: Business): OpenStatus => {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

  const todayHours = business.hours[currentDay];

  if (!todayHours || (typeof todayHours === 'string' && todayHours.toLowerCase() === 'closed')) {
    return { isOpen: false, nextChange: 'Opens tomorrow' };
  }

  // Here expecting todayHours like { open: "07:00:00", close: "19:00:00" }
  // Convert times to minutes
  const toMinutes = (timeStr: string) => {
    const [hourStr, minStr] = timeStr.split(':');
    return parseInt(hourStr, 10) * 60 + parseInt(minStr, 10);
  };

  const openTime = toMinutes(todayHours.open);
  const closeTime = toMinutes(todayHours.close);

  const isOpen = currentTime >= openTime && currentTime <= closeTime;
  const closingSoon = isOpen && (closeTime - currentTime) <= 60; // within 1 hour

  const formatTime = (minutes: number) => {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  let nextChange = '';
  if (isOpen) {
    nextChange = `Closes at ${formatTime(closeTime)}`;
  } else {
    nextChange = `Opens at ${formatTime(openTime)}`;
  }

  return { isOpen, nextChange, closingSoon };
};
