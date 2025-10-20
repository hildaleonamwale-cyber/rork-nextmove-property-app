import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<HomepageBanner[]>(defaultBanners);
  const [sections, setSections] = useState<HomepageSection[]>(defaultSections);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [adminStatus, storedBanners, storedSections, storedSettings, storedUsers] = await Promise.all([
        AsyncStorage.getItem(SUPER_ADMIN_KEY),
        AsyncStorage.getItem(BANNERS_KEY),
        AsyncStorage.getItem(SECTIONS_KEY),
        AsyncStorage.getItem(SYSTEM_SETTINGS_KEY),
        AsyncStorage.getItem(USERS_KEY),
      ]);

      setIsSuperAdmin(adminStatus === 'true');
      if (storedBanners) setBanners(JSON.parse(storedBanners));
      if (storedSections) setSections(JSON.parse(storedSections));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
      if (storedUsers) setUsers(JSON.parse(storedUsers));
    } catch (error) {
      console.error('Failed to load super admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const enableSuperAdmin = useCallback(async () => {
    try {
      await AsyncStorage.setItem(SUPER_ADMIN_KEY, 'true');
      setIsSuperAdmin(true);
      console.log('Super Admin mode enabled');
    } catch (error) {
      console.error('Failed to enable super admin:', error);
    }
  }, []);

  const disableSuperAdmin = useCallback(async () => {
    try {
      await AsyncStorage.setItem(SUPER_ADMIN_KEY, 'false');
      setIsSuperAdmin(false);
      console.log('Super Admin mode disabled');
    } catch (error) {
      console.error('Failed to disable super admin:', error);
    }
  }, []);

  const updateBanner = useCallback(async (bannerId: string, updates: Partial<HomepageBanner>) => {
    const updated = banners.map((b) => (b.id === bannerId ? { ...b, ...updates } : b));
    setBanners(updated);
    await AsyncStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
  }, [banners]);

  const addBanner = useCallback(async (banner: Omit<HomepageBanner, 'id'>) => {
    const newBanner = { ...banner, id: Date.now().toString() };
    const updated = [...banners, newBanner];
    setBanners(updated);
    await AsyncStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
  }, [banners]);

  const deleteBanner = useCallback(async (bannerId: string) => {
    const updated = banners.filter((b) => b.id !== bannerId);
    setBanners(updated);
    await AsyncStorage.setItem(BANNERS_KEY, JSON.stringify(updated));
  }, [banners]);

  const reorderBanners = useCallback(async (reordered: HomepageBanner[]) => {
    setBanners(reordered);
    await AsyncStorage.setItem(BANNERS_KEY, JSON.stringify(reordered));
  }, []);

  const updateSection = useCallback(async (sectionId: string, updates: Partial<HomepageSection>) => {
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s));
    setSections(updated);
    await AsyncStorage.setItem(SECTIONS_KEY, JSON.stringify(updated));
  }, [sections]);

  const addSection = useCallback(async (section: Omit<HomepageSection, 'id'>) => {
    const newSection = { ...section, id: `s${Date.now()}` };
    const updated = [...sections, newSection];
    setSections(updated);
    await AsyncStorage.setItem(SECTIONS_KEY, JSON.stringify(updated));
  }, [sections]);

  const deleteSection = useCallback(async (sectionId: string) => {
    const updated = sections.filter((s) => s.id !== sectionId);
    setSections(updated);
    await AsyncStorage.setItem(SECTIONS_KEY, JSON.stringify(updated));
  }, [sections]);

  const reorderSections = useCallback(async (reordered: HomepageSection[]) => {
    setSections(reordered);
    await AsyncStorage.setItem(SECTIONS_KEY, JSON.stringify(reordered));
  }, []);

  const updateSettings = useCallback(async (updates: Partial<SystemSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await AsyncStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(updated));
  }, [settings]);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    setUsers(updated);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
  }, [users]);

  const deleteUser = useCallback(async (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
  }, [users]);

  const blockUser = useCallback(async (userId: string) => {
    await updateUser(userId, { blocked: true });
  }, [updateUser]);

  const unblockUser = useCallback(async (userId: string) => {
    await updateUser(userId, { blocked: false });
  }, [updateUser]);

  const upgradeUserTier = useCallback(async (userId: string, tier: AccountTier) => {
    await updateUser(userId, { accountTier: tier });
  }, [updateUser]);

  const analytics = useMemo(() => ({
    totalUsers: users.length,
    totalAgents: users.filter((u) => u.role === 'agent').length,
    totalAgencies: users.filter((u) => u.role === 'agency').length,
    totalProperties: users.reduce((sum, u) => sum + u.propertiesCount, 0),
    totalBookings: users.reduce((sum, u) => sum + u.bookingsCount, 0),
    blockedUsers: users.filter((u) => u.blocked).length,
  }), [users]);

  return useMemo(() => ({
    isSuperAdmin,
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
    settings,
    updateSettings,
    users,
    updateUser,
    deleteUser,
    blockUser,
    unblockUser,
    upgradeUserTier,
    analytics,
  }), [
    isSuperAdmin,
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
    settings,
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
