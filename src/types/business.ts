// src/types/business.ts

export type BusinessCategory =
  | 'all'
  | 'fnb'
  | 'dietary-options'
  | 'retail'
  | 'services'
  | 'entertainment'
  | 'health-wellness'
  | 'professional-services'
  | 'home-living';

export interface Business {
  id: string; // from uen
  name: string; // from businessName
  category: BusinessCategory; // from businessCategory (adjust union type keys if needed)
  subcategory?: string;

  address: string;
  phone: string; // from phoneNumber
  website?: string; // from websiteLink
  description: string;
  image: string; // from wallpaper

  rating?: number; // optional if backend provides
  reviewCount?: number; // optional if backend provides

  priceRange: 'low' | 'medium' | 'high'; // mapped from priceTier

  hours: {
    [day: string]: {
      open: string;
      close: string;
    };
  };

  coordinates?: {
    lat: number;
    lng: number;
  };

  offersDelivery?: boolean;
  offersPickup?: boolean;
  paymentOptions?: string[];

  isPopular?: boolean;
  tags?: string[];
}

// Missing interface added here
export interface BookmarkedBusiness {
  businessId: string;
  dateBookmarked: string;
}

export interface Review {
  id: string;
  businessId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  businessId?: string;
  businessName?: string;
  date: string;
  image?: string;
  isLatest?: boolean;
}

export interface OpenStatus {
  isOpen: boolean;
  nextChange?: string;
  closingSoon?: boolean;
}
