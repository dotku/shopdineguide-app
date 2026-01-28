export type BusinessSection = 'shop' | 'dine' | 'guide';
export type ContentFilter = 'all' | 'hot' | 'free' | 'deals' | 'coupons' | 'brands';

export interface Business {
  id: number;
  name: string;
  section: BusinessSection;
  address?: string;
  city?: string;
  neighborhood?: string;
  state?: string;
  zip?: string;
  phone?: string;
  website?: string;
  email?: string;
  logoUrl?: string;
  posterUrl?: string;
  bannerUrl?: string;
  qrCodeUrl?: string;
  galleryUrls?: string;
  googleMapsUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  yelpUrl?: string;
  description?: string;
  hours?: string;
  categories?: string;
  likeCount: number;
  isHot: number;
  isFree: number;
  isAd: number;
  orderUrl?: string;
  fetchedAt?: string;
}

export interface Deal {
  id: number;
  businessId: number;
  title: string;
  description?: string;
  discountText?: string;
  expiryDate?: string;
  terms?: string;
  imageUrl?: string;
  fetchedAt?: string;
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed?: boolean;
}
