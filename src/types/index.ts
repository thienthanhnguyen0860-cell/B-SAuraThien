import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'agent' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone: string | null;
  photoURL: string | null;
  role: UserRole;
  favorites: string[];
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any | null;
  status: UserStatus;
  isBlocked?: boolean;
}

export type ListingType = 'sale' | 'rent';

export type PropertyType =
  | 'apartment'
  | 'penthouse'
  | 'villa'
  | 'townhouse'
  | 'shophouse'
  | 'land'
  | 'resort';

export type PropertyStatus =
  | 'draft'
  | 'available'
  | 'reserved'
  | 'sold'
  | 'rented'
  | 'hidden';

export type PriceUnit = 'VND' | 'VND/month' | 'negotiable';

export interface PropertyLocation {
  province: string;
  district: string;
  ward: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PropertySEO {
  title: string;
  description: string;
  keywords: string;
  ogImage: string | null;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  propertyCode: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  shortDescription: string;
  description: string;
  price: number;
  priceUnit: PriceUnit;
  area: number; // m²
  bedrooms: number;
  bathrooms: number;
  floors: number;
  parkingSlots: number;
  direction: string | null;
  projectId: string | null;
  projectName?: string | null;
  categoryId: string | null;
  agentId: string | null;
  address: string;
  location: PropertyLocation;
  amenities: string[];
  legalStatus: string;
  legal?: string;
  furnishing?: string;
  images: string[];
  thumbnail: string;
  videoUrl: string | null;
  virtualTourUrl: string | null;
  featured: boolean;
  isFeatured?: boolean;
  isHot: boolean;
  isNew: boolean;
  viewCount: number;
  favoriteCount: number;
  inquiryCount: number;
  reservedByReservationId?: string | null;
  createdAt: any;
  updatedAt: any;
  publishedAt: any | null;
  seo: PropertySEO;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  developer: string;
  projectType: string;
  status: 'upcoming' | 'selling' | 'completed' | 'sold_out';
  address: string;
  province: string;
  district: string;
  description: string;
  thumbnail: string;
  gallery: string[];
  latitude: number | null;
  longitude: number | null;
  totalUnits: number;
  availableUnits: number;
  minPrice: number | null;
  maxPrice: number | null;
  amenities: string[];
  featured: boolean;
  createdAt: any;
  updatedAt: any;
  seo: PropertySEO;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  active: boolean;
  createdAt: any;
  updatedAt: any;
}

export type InquirySource = 'property_detail' | 'contact' | 'callback' | 'reservation' | string;
export type InquiryStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'spam';

export interface Inquiry {
  id: string;
  userId?: string | null;
  propertyId?: string;
  propertyTitle?: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  source: InquirySource;
  status: InquiryStatus;
  assignedAgentId?: string | null;
  assignedTo?: string | null;
  adminNote?: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export type ReservationStatus = 'pending' | 'paid' | 'cancelled' | 'expired' | 'refunded';

export interface Reservation {
  id: string;
  reservationCode: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  propertyId: string;
  propertyTitle: string;
  propertyCode?: string;
  propertyThumbnail?: string;
  depositAmount: number;
  transferContent: string;
  status: ReservationStatus;
  paymentMethod: 'bank_transfer';
  createdAt: any;
  expiresAt: any | null;
  approvedAt: any | null;
  approvedBy: string | null;
  cancelledAt: any | null;
  adminNote: string;
}

export interface PaymentPublicSettings {
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  qrTemplateUrl?: string | null;
  qrTemplate?: string;
  paymentInstructions: string;
  reservationDepositDefault: number;
  reservationExpiryMinutes: number;
  updatedAt?: any;
}

export interface PaymentPrivateSettings {
  secretApiKey?: string | null;
  webhookSecret?: string | null;
  merchantId?: string | null;
  updatedAt?: any;
}

export interface PaymentSettings extends PaymentPublicSettings {
  id?: string;
}

export interface SiteHero {
  eyebrow: string;
  heading: string;
  description: string;
  backgroundImage: string;
  primaryCTA: string;
  secondaryCTA: string;
}

export interface SiteStats {
  properties: number;
  customers: number;
  projects: number;
  yearsExperience: number;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  brandName?: string;
  slogan?: string;
  logoText?: string;
  logoUrl: string;
  faviconUrl: string;
  hotline: string;
  email: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
  zaloUrl: string;
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    zalo?: string;
    instagram?: string;
  };
  hero: SiteHero;
  stats: SiteStats;
  footerDescription: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultOgImage: string;
  };
  analytics: {
    googleAnalyticsId: string;
  };
  updatedAt: any;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: any;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  position?: string;
  title?: string;
  specialties?: string[];
  bio?: string;
  facebook?: string;
  zalo?: string;
  active?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface PropertyFilterParams {
  keyword?: string;
  listingType?: ListingType | 'all';
  propertyType?: PropertyType | 'all';
  province?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number | 'all';
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc' | 'most_viewed';
  page?: number;
  limit?: number;
}
