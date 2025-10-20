export interface PropertyFlag {
  id: string;
  propertyId: string;
  reportedBy: string;
  reporterName: string;
  reason: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface UserFlag {
  id: string;
  userId: string;
  reportedBy: string;
  reporterName: string;
  reason: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'user_edit' | 'user_delete' | 'user_block' | 'user_upgrade' | 
          'property_edit' | 'property_delete' | 'property_flag_resolve' |
          'banner_edit' | 'section_edit' | 'settings_edit' | 'login';
  targetType: 'user' | 'property' | 'banner' | 'section' | 'system';
  targetId: string;
  details: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PropertyFilters {
  search: string;
  type: string[];
  location: string[];
  status: string[];
  managementStatus: string[];
  packageLevel: string[];
  flagged: boolean | null;
  dateFrom: string;
  dateTo: string;
  minBookings: number | null;
  maxBookings: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface UserFilters {
  search: string;
  role: string[];
  accountTier: string[];
  status: 'all' | 'active' | 'inactive' | 'blocked';
  verified: boolean | null;
  flagged: boolean | null;
  dateFrom: string;
  dateTo: string;
  lastActiveFrom: string;
  lastActiveTo: string;
}

export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalAgents: number;
    totalAgencies: number;
    totalProperties: number;
    totalBookings: number;
    activeListings: number;
    flaggedContent: number;
    blockedUsers: number;
  };
  trends: {
    newUsersThisMonth: number;
    newUsersLastMonth: number;
    bookingsThisWeek: number;
    bookingsLastWeek: number;
    listingsThisMonth: number;
    listingsLastMonth: number;
  };
  usersByRole: {
    clients: number;
    agents: number;
    agencies: number;
  };
  usersByPackage: {
    free: number;
    pro: number;
    agency: number;
  };
  propertiesByType: {
    apartment: number;
    house: number;
    villa: number;
    condo: number;
    commercial: number;
  };
  propertiesByStatus: {
    forRent: number;
    forSale: number;
    managed: number;
    vacant: number;
    occupied: number;
  };
  recentActivity: AuditLog[];
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange: {
    from: string;
    to: string;
  };
  includeFilters: boolean;
}

export interface BulkAction {
  type: 'delete' | 'block' | 'unblock' | 'upgrade' | 'downgrade' | 'verify' | 'flag' | 'approve';
  targetIds: string[];
  value?: any;
}
