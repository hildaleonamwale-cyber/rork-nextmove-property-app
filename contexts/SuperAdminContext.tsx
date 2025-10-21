import { useMemo, useCallback, useState, useEffect } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useSupabaseBanners, useSupabaseSections, useSupabaseUsers, useSupabaseUserStats } from '@/hooks/useSupabaseAdmin';
import { supabase } from '@/lib/supabase';

export type UserRole = 'client' | 'agent' | 'agency' | 'admin';
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

export const [SuperAdminProvider, useSuperAdmin] = createContextHook(() => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSuperAdmin(session?.user?.email === 'support@nextmove.co.zw');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsSuperAdmin(session?.user?.email === 'support@nextmove.co.zw');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const { 
    banners: supabaseBanners = [], 
    isLoading: bannersLoading, 
    error: bannersError,
    createBanner, 
    updateBanner: updateSupabaseBanner, 
    deleteBanner: deleteSupabaseBanner 
  } = useSupabaseBanners();
  
  const { 
    sections: supabaseSections = [], 
    isLoading: sectionsLoading, 
    error: sectionsError,
    createSection, 
    updateSection: updateSupabaseSection, 
    deleteSection: deleteSupabaseSection 
  } = useSupabaseSections();
  
  const { 
    users: supabaseUsers = [], 
    isLoading: usersLoading, 
    error: usersError,
    updateUserRole, 
    blockUser: blockSupabaseUser, 
    unblockUser: unblockSupabaseUser
  } = useSupabaseUsers();
  
  const { 
    stats 
  } = useSupabaseUserStats();

  const isLoading = bannersLoading || sectionsLoading || usersLoading;
  const error = bannersError || sectionsError || usersError;

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
    type: s.type as HomepageSection['type'],
    title: s.title,
    subtitle: undefined,
    icon: undefined,
    enabled: s.enabled,
    order: s.order,
    config: s.config,
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
    console.log('Super Admin mode enabled');
  }, []);

  const disableSuperAdmin = useCallback(async () => {
    console.log('Super Admin mode disabled');
  }, []);

  const updateBanner = useCallback(async (bannerId: string, updates: Partial<HomepageBanner>) => {
    try {
      await updateSupabaseBanner(bannerId, { ...updates, imageUrl: updates.imageUrl || '' });
    } catch (error) {
      console.error('Failed to update banner:', error);
      throw error;
    }
  }, [updateSupabaseBanner]);

  const addBanner = useCallback(async (banner: Omit<HomepageBanner, 'id'>) => {
    try {
      await createBanner(banner);
    } catch (error) {
      console.error('Failed to add banner:', error);
      throw error;
    }
  }, [createBanner]);

  const deleteBanner = useCallback(async (bannerId: string) => {
    try {
      await deleteSupabaseBanner(bannerId);
    } catch (error) {
      console.error('Failed to delete banner:', error);
      throw error;
    }
  }, [deleteSupabaseBanner]);

  const reorderBanners = useCallback(async (reordered: HomepageBanner[]) => {
    try {
      for (const banner of reordered) {
        await updateSupabaseBanner(banner.id, banner);
      }
    } catch (error) {
      console.error('Failed to reorder banners:', error);
      throw error;
    }
  }, [updateSupabaseBanner]);

  const updateSection = useCallback(async (sectionId: string, updates: Partial<HomepageSection>) => {
    try {
      await updateSupabaseSection(sectionId, { 
        title: updates.title || '', 
        type: updates.type as never, 
        config: updates.config, 
        order: updates.order || 0, 
        enabled: updates.enabled !== undefined ? updates.enabled : true 
      });
    } catch (error) {
      console.error('Failed to update section:', error);
      throw error;
    }
  }, [updateSupabaseSection]);

  const addSection = useCallback(async (section: Omit<HomepageSection, 'id'>) => {
    try {
      await createSection({ 
        title: section.title, 
        type: section.type as never, 
        config: section.config, 
        order: section.order, 
        enabled: section.enabled 
      });
    } catch (error) {
      console.error('Failed to add section:', error);
      throw error;
    }
  }, [createSection]);

  const deleteSection = useCallback(async (sectionId: string) => {
    try {
      await deleteSupabaseSection(sectionId);
    } catch (error) {
      console.error('Failed to delete section:', error);
      throw error;
    }
  }, [deleteSupabaseSection]);

  const reorderSections = useCallback(async (reordered: HomepageSection[]) => {
    try {
      for (const section of reordered) {
        await updateSupabaseSection(section.id, { 
          title: section.title, 
          type: section.type as never, 
          config: section.config, 
          order: section.order, 
          enabled: section.enabled 
        });
      }
    } catch (error) {
      console.error('Failed to reorder sections:', error);
      throw error;
    }
  }, [updateSupabaseSection]);

  const updateSettings = useCallback(async (updates: Partial<SystemSettings>) => {
    console.log('Update settings:', updates);
  }, []);

  const updateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      if (updates.role) {
        await updateUserRole(userId, updates.role);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, [updateUserRole]);

  const deleteUser = useCallback(async (userId: string) => {
    console.log('Delete user not implemented:', userId);
  }, []);

  const blockUser = useCallback(async (userId: string) => {
    try {
      await blockSupabaseUser(userId);
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    }
  }, [blockSupabaseUser]);

  const unblockUser = useCallback(async (userId: string) => {
    try {
      await unblockSupabaseUser(userId);
    } catch (error) {
      console.error('Failed to unblock user:', error);
      throw error;
    }
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
    isSuperAdmin,
    isLoading,
    error,
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
    isSuperAdmin,
    isLoading,
    error,
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
