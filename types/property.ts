export type ListingCategory = 'property' | 'stand' | 'room' | 'commercial';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'monthly' | 'sale';
  location: {
    address: string;
    area: string;
    city: string;
    province: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: 'apartment' | 'house' | 'villa' | 'condo' | 'room';
  status: 'For Rent' | 'For Sale' | 'Internal Management';
  verified: boolean;
  featured: boolean;
  amenities: string[];
  tourLink?: string;
  agentId: string;
  views: number;
  bookings: number;
  inquiries: number;
  listingCategory: ListingCategory;
  lister?: {
    type: 'company' | 'private';
    companyName?: string;
    companyLogo?: string;
  };
  createdAt?: Date;
}

export interface Stand {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'sale';
  location: {
    address: string;
    area: string;
    city: string;
    province: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  area: number;
  landFeatures?: string[];
  status: 'For Sale';
  verified: boolean;
  featured: boolean;
  tourLink?: string;
  agentId: string;
  views: number;
  bookings: number;
  inquiries: number;
  listingCategory: 'stand';
  lister?: {
    type: 'company' | 'private';
    companyName?: string;
    companyLogo?: string;
  };
  createdAt?: Date;
  titleDeeds: boolean;
  serviced: boolean;
  developerSession?: string;
}

export interface CommercialProperty {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'monthly' | 'sale';
  location: {
    address: string;
    area: string;
    city: string;
    province: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  area: number;
  floors: number;
  parkingSpaces: number;
  commercialType: 'office' | 'warehouse' | 'shop' | 'industrial' | 'retail';
  status: 'For Rent' | 'For Sale';
  verified: boolean;
  featured: boolean;
  features: string[];
  tourLink?: string;
  agentId: string;
  views: number;
  bookings: number;
  inquiries: number;
  listingCategory: 'commercial';
  lister?: {
    type: 'company' | 'private';
    companyName?: string;
    companyLogo?: string;
  };
  createdAt?: Date;
  furnished?: boolean;
  yearBuilt?: number;
  zoning?: string;
}

export type Listing = Property | Stand | CommercialProperty;

export interface Agency {
  id: string;
  name: string;
  logo: string;
  description: string;
  verified: boolean;
  properties: number;
  featuredProperties: string[];
  banner?: string;
  bio?: string;
  founded?: number;
  staff: CompanyStaff[];
  followers: number;
  following: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  specialties: string[];
  profileCards?: ProfileCard[];
}

export interface Booking {
  id: string;
  propertyId: string;
  date: Date;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  agencyId?: string;
  properties: string[];
  title?: string;
  bio?: string;
  banner?: string;
  verified: boolean;
  followers: number;
  following: number;
  specialties: string[];
  yearsExperience: number;
  languages: string[];
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface CompanyStaff {
  id: string;
  name: string;
  avatar: string;
  title: string;
  email: string;
  phone: string;
  specialties: string[];
}

export interface Filter {
  priceRange: [number, number];
  propertyType: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  verifiedOnly: boolean;
  status: ('For Rent' | 'For Sale' | 'Internal Management')[];
  listingCategory?: ListingCategory[];
}

export type AgentPackage = 'free' | 'pro' | 'agency';

export interface ProfileCard {
  id: string;
  image: string;
  title: string;
  description?: string;
  ctaText: string;
  ctaLink?: string;
  propertyId?: string;
  order: number;
}

export interface AgentProfile {
  id: string;
  userId: string;
  package: AgentPackage;
  accountSetupComplete: boolean;
  companyName?: string;
  companyLogo?: string;
  banner?: string;
  bio?: string;
  specialties: string[];
  yearsExperience?: number;
  languages: string[];
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  updates: AgentUpdate[];
  staff: StaffMember[];
  bookingSlots: BookingSlot[];
  analytics: AgentAnalytics;
  verified: boolean;
  profileCards?: ProfileCard[];
}

export interface AgentUpdate {
  id: string;
  content: string;
  timestamp: Date;
  images?: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  phone?: string;
  permissions?: string[];
  active?: boolean;
  inviteToken?: string;
  inviteExpiry?: Date;
}

export interface BookingSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  booked?: boolean;
  bookedBy?: string;
  clientId?: string;
}

export interface AgentAnalytics {
  views: {
    total: number;
    thisMonth: number;
    trend: number;
  };
  inquiries: {
    total: number;
    thisMonth: number;
    trend: number;
  };
  bookings: {
    total: number;
    thisMonth: number;
    trend: number;
  };
  propertyViews: {
    propertyId: string;
    views: number;
  }[];
  topPerformingProperty?: string;
}

export interface PropertyDraft {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'monthly' | 'sale';
  location: {
    address: string;
    area: string;
    city: string;
    province: string;
    country: string;
  };
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: 'apartment' | 'house' | 'villa' | 'condo';
  status: 'For Rent' | 'For Sale' | 'Internal Management';
  amenities: string[];
  tourLink?: string;
  tags: string[];
}

export type ManagedPropertyStatus = 'Vacant' | 'Occupied' | 'Under Maintenance' | 'For Sale';
export type ManagedPropertyType = 'Residential' | 'Commercial';

export interface ManagedProperty {
  id: string;
  name: string;
  address: string;
  type: ManagedPropertyType;
  status: ManagedPropertyStatus;
  notes?: string;
  images: string[];
  documents: PropertyDocument[];
  tenant?: TenantDetails;
  createdAt: Date;
  updatedAt: Date;
  isListed: boolean;
  listedPropertyId?: string;
}

export interface PropertyDocument {
  id: string;
  name: string;
  type: 'invoice' | 'inspection' | 'lease' | 'other';
  url: string;
  uploadedAt: Date;
}

export interface TenantDetails {
  name: string;
  phone: string;
  email?: string;
  moveInDate: Date;
  moveOutDate?: Date;
  notes?: string;
}
