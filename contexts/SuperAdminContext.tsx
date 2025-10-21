import { useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useSupabaseBanners, useSupabaseSections, useSupabaseUsers, useSupabaseUserStats } from '@/hooks/useSupabaseAdmin';

export type UserRole = 'user' | 'agent' | 'agency' | 'super_admin';
export type AccountTier = 'free' | 'pro' | 'agency';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountTier: AccountTier;
  blocked: boolean;
  createdAt: string;
  lastActive: string;
  propertiesCount: number;
  bookingsCount: number;
}

export interface HomepageBanner {
  id: string;
  imageUrl: string;
  title: string;
  link: string;
  enabled: boolean;
  order: number;
}

export interface HomepageSection {
  id: string;
  type: 'featured_properties' | 'browse_properties' | 'featured_agencies' | 'custom';
  title: string;
  subtitle?: string;
  icon?: string;
  enabled: boolean;
  order: number;
  config: {
    filterType?: 'featured' | 'area' | 'type' | 'all' | 'manual';
    area?: string;
    propertyType?: string;
    limit?: number;
    layoutType?: 'carousel' | 'grid';
    selectedProperties?: string[];
  };
  analytics?: {
    views: number;
    clicks: number;
  };
}

export interface SystemSettings {
  bannerPricing: {
    monthlyPrice: number;
    yearlyPrice: number;
  };
  featureGating: {
    maxPropertiesFree: number;
    maxPropertiesPro: number;
    analyticsEnabled: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
}

const SUPER_ADMIN_KEY = '@is_super_admin';
const BANNERS_KEY = '@homepage_banners';
const SECTIONS_KEY = '@homepage_sections';
const SYSTEM_SETTINGS_KEY = '@system_settings';
const USERS_KEY = '@users_data';

const defaultBanners: HomepageBanner[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    title: 'Premium Properties',
    link: '/properties/premium',
    enabled: true,
    order: 1,
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    title: 'Luxury Homes',
    link: '/properties/luxury',
    enabled: true,
    order: 2,
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    title: 'Modern Apartments',
    link: '/properties/apartments',
    enabled: true,
    order: 3,
  },
];

const defaultSections: HomepageSection[] = [
  {
    id: 's1',
    type: 'featured_properties',
    title: 'Featured Properties',
    subtitle: 'Hand-picked premium listings',
    icon: '⭐',
    enabled: true,
    order: 1,
    config: {
      filterType: 'manual',
      limit: 10,
      layoutType: 'carousel',
      selectedProperties: [],
    },
    analytics: {
      views: 12453,
      clicks: 892,
    },
  },
  {
    id: 's2',
    type: 'browse_properties',
    title: 'Just Listed',
    subtitle: 'Recently added properties',
    icon: '🆕',
    enabled: true,
    order: 2,
    config: {
      filterType: 'all',
      limit: 20,
      layoutType: 'grid',
    },
    analytics: {
      views: 8234,
      clicks: 612,
    },
  },
  {
    id: 's3',
    type: 'custom',
    title: 'Browse by Category',
    subtitle: 'Explore all property types',
    icon: '📂',
    enabled: true,
    order: 3,
    config: {
      filterType: 'all',
      limit: 30,
      layoutType: 'grid',
    },
    analytics: {
      views: 6721,
      clicks: 445,
    },
  },
];

const defaultSettings: SystemSettings = {
  bannerPricing: {
    monthlyPrice: 500,
    yearlyPrice: 5000,
  },
  featureGating: {
    maxPropertiesFree: 3,
    maxPropertiesPro: 50,
    analyticsEnabled: true,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
  },
};

const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'user',
    accountTier: 'free',
    blocked: false,
    createdAt: '2024-01-15',
    lastActive: '2025-01-17',
    propertiesCount: 0,
    bookingsCount: 3,
  },
  {
    id: 'u2',
    name: 'Sarah Johnson',
    email: 'sarah@realty.com',
    role: 'agent',
    accountTier: 'pro',
    blocked: false,
    createdAt: '2023-11-20',
    lastActive: '2025-01-18',
    propertiesCount: 12,
    bookingsCount: 45,
  },
  {
    id: 'u3',
    name: 'Elite Properties Agency',
    email: 'contact@eliteproperties.com',
    role: 'agency',
    accountTier: 'agency',
    blocked: false,
    createdAt: '2023-08-10',
    lastActive: '2025-01-18',
    propertiesCount: 87,
    bookingsCount: 234,
  },
];

export const [SuperAdminProvider, useSuperAdmin] = createContextHook(() => {
  const { banners: supabaseBanners, isLoading: bannersLoading, createBanner, updateBanner: updateSupabaseBanner, deleteBanner: deleteSupabaseBanner } = useSupabaseBanners();
  const { sections: supabaseSections, isLoading: sectionsLoading, createSection, updateSection: updateSupabaseSection, deleteSection: deleteSupabaseSection } = useSupabaseSections();
  const { users: supabaseUsers, isLoading: usersLoading, updateUserRole, blockUser: blockSupabaseUser, unblockUser: unblockSupabaseUser, verifyUser } = useSupabaseUsers();
  const { stats } = useSupabaseUserStats();

  const isLoading = bannersLoading || sectionsLoading || usersLoading;

  const banners: HomepageBanner[] = supabaseBanners.map((b) => ({
    id: b.id,
    imageUrl: b.imageUrl,
    title: b.title,
    link: b.link || '',
    enabled: b.enabled,
    order: b.order,
  }));

  const sections: HomepageSection[] = supabaseSections.map((s) => ({
    id: s.id,
    type: s.type as any,
    title: s.title,
    subtitle: undefined,
    icon: undefined,
    enabled: s.enabled,
    order: s.order,
    config: s.filters,
    analytics: undefined,
  }));

  const users: User[] = supabaseUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    accountTier: 'free' as AccountTier,
    blocked: u.blocked || false,
    createdAt: new Date(u.created_at).toISOString().split('T')[0],
    lastActive: new Date(u.updated_at || u.created_at).toISOString().split('T')[0],
    propertiesCount: 0,
    bookingsCount: 0,
  }));

  const enableSuperAdmin = useCallback(async () => {
    await AsyncStorage.setItem(SUPER_ADMIN_KEY, 'true');
    console.log('Super Admin mode enabled');
  }, []);

  const disableSuperAdmin = useCallback(async () => {
    await AsyncStorage.setItem(SUPER_ADMIN_KEY, 'false');
    console.log('Super Admin mode disabled');
  }, []);

  const updateBanner = useCallback(async (bannerId: string, updates: Partial<HomepageBanner>) => {
    await updateSupabaseBanner(bannerId, { ...updates, imageUrl: updates.imageUrl || '' });
  }, [updateSupabaseBanner]);

  const addBanner = useCallback(async (banner: Omit<HomepageBanner, 'id'>) => {
    await createBanner(banner);
  }, [createBanner]);

  const deleteBanner = useCallback(async (bannerId: string) => {
    await deleteSupabaseBanner(bannerId);
  }, [deleteSupabaseBanner]);

  const reorderBanners = useCallback(async (reordered: HomepageBanner[]) => {
    for (const banner of reordered) {
      await updateSupabaseBanner(banner.id, banner);
    }
  }, [updateSupabaseBanner]);

  const updateSection = useCallback(async (sectionId: string, updates: Partial<HomepageSection>) => {
    await updateSupabaseSection(sectionId, { title: updates.title || '', type: updates.type as any, filters: updates.config, order: updates.order || 0, enabled: updates.enabled !== undefined ? updates.enabled : true });
  }, [updateSupabaseSection]);

  const addSection = useCallback(async (section: Omit<HomepageSection, 'id'>) => {
    await createSection({ title: section.title, type: section.type as any, filters: section.config, order: section.order, enabled: section.enabled });
  }, [createSection]);

  const deleteSection = useCallback(async (sectionId: string) => {
    await deleteSupabaseSection(sectionId);
  }, [deleteSupabaseSection]);

  const reorderSections = useCallback(async (reordered: HomepageSection[]) => {
    for (const section of reordered) {
      await updateSupabaseSection(section.id, { title: section.title, type: section.type as any, filters: section.config, order: section.order, enabled: section.enabled });
    }
  }, [updateSupabaseSection]);

  const updateSettings = useCallback(async (updates: Partial<SystemSettings>) => {
    await AsyncStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(updates));
  }, []);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    if (updates.role) {
      await updateUserRole(userId, updates.role);
    }
  }, [updateUserRole]);

  const deleteUser = useCallback(async (userId: string) => {
    console.log('Delete user not implemented:', userId);
  }, []);

  const blockUser = useCallback(async (userId: string) => {
    await blockSupabaseUser(userId);
  }, [blockSupabaseUser]);

  const unblockUser = useCallback(async (userId: string) => {
    await unblockSupabaseUser(userId);
  }, [unblockSupabaseUser]);

  const upgradeUserTier = useCallback(async (userId: string, tier: AccountTier) => {
    console.log('Upgrade user tier not implemented:', userId, tier);
  }, []);

  const analytics = useMemo(() => ({
    totalUsers: stats.totalUsers,
    totalAgents: stats.totalAgents,
    totalAgencies: 0,
    totalProperties: 0,
    totalBookings: 0,
    blockedUsers: 0,
  }), [stats]);

  return useMemo(() => ({
    isSuperAdmin: true,
    isLoading,
    enableSuperAdmin,
    disableSuperAdmin,
    banners,
    updateBanner,
    addBanner,
    deleteBanner,
    reorderBanners,
    sections,
    updateSection,
    addSection,
    deleteSection,
    reorderSections,
    settings: defaultSettings,
    updateSettings,
    users,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
    upgradeUserTier,
    analytics,
  }), [
    isLoading,
    enableSuperAdmin,
    disableSuperAdmin,
    banners,
    updateBanner,
    addBanner,
    deleteBanner,
    reorderBanners,
    sections,
    updateSection,
    addSection,
    deleteSection,
    reorderSections,
    updateSettings,
    users,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
    upgradeUserTier,
    analytics,
  ]);
});
