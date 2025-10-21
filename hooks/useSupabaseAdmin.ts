import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  order: number;
  enabled: boolean;
  createdAt: Date;
}

export interface Section {
  id: string;
  title: string;
  type: 'featured_properties' | 'browse_properties' | 'featured_agencies' | 'custom';
  config: any;
  order: number;
  enabled: boolean;
  createdAt: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalAgents: number;
}

export function useSupabaseBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();

    const subscription = supabase
      .channel('banners_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => {
        console.log('Banners changed, refetching...');
        fetchBanners();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('banners')
        .select('id, title, image_url, link, order, enabled, created_at')
        .order('order', { ascending: true });

      if (fetchError) {
        console.error('Banners fetch error:', fetchError);
        setBanners([]);
        setError(fetchError.message);
        return;
      }

      setBanners(data?.map(transformBanner) || []);
    } catch (err: any) {
      console.error('Failed to fetch banners:', err);
      setBanners([]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createBanner = async (banner: Omit<Banner, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('banners').insert({
      title: banner.title,
      image_url: banner.imageUrl,
      link: banner.link,
      order: banner.order,
      enabled: banner.enabled,
    });

    if (error) throw error;
    await fetchBanners();
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    const { error } = await supabase
      .from('banners')
      .update({
        title: updates.title,
        image_url: updates.imageUrl,
        link: updates.link,
        order: updates.order,
        enabled: updates.enabled,
      })
      .eq('id', id);

    if (error) throw error;
    await fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) throw error;
    await fetchBanners();
  };

  return { banners, isLoading, error, createBanner, updateBanner, deleteBanner, refetch: fetchBanners };
}

export function useSupabaseSections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();

    const subscription = supabase
      .channel('sections_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_sections' }, () => {
        console.log('Sections changed, refetching...');
        fetchSections();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('order', { ascending: true });

      if (fetchError) {
        console.error('Sections fetch error:', fetchError);
        setSections([]);
        setError(fetchError.message);
        return;
      }

      setSections(data?.map(transformSection) || []);
    } catch (err: any) {
      console.error('Failed to fetch sections:', err);
      setSections([]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createSection = async (section: Omit<Section, 'id' | 'createdAt'>) => {
    const { error } = await supabase.from('homepage_sections').insert({
      title: section.title,
      type: section.type,
      config: typeof section.config === 'string' ? section.config : JSON.stringify(section.config),
      order: section.order,
      enabled: section.enabled,
    });

    if (error) throw error;
    await fetchSections();
  };

  const updateSection = async (id: string, updates: Partial<Section>) => {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.config !== undefined) updateData.config = typeof updates.config === 'string' ? updates.config : JSON.stringify(updates.config);
    if (updates.order !== undefined) updateData.order = updates.order;
    if (updates.enabled !== undefined) updateData.enabled = updates.enabled;

    const { error } = await supabase
      .from('homepage_sections')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
    await fetchSections();
  };

  const deleteSection = async (id: string) => {
    const { error } = await supabase.from('homepage_sections').delete().eq('id', id);
    if (error) throw error;
    await fetchSections();
  };

  return { sections, isLoading, error, createSection, updateSection, deleteSection, refetch: fetchSections };
}

export function useSupabaseUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();

    const subscription = supabase
      .channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        console.log('Users changed, refetching...');
        fetchUsers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, email, name, phone, avatar, role, verified, blocked, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Users fetch error:', fetchError);
        setUsers([]);
        setError(fetchError.message);
        return;
      }

      setUsers(data || []);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
    await fetchUsers();
  };

  const blockUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ blocked: true })
      .eq('id', userId);

    if (error) throw error;
    await fetchUsers();
  };

  const unblockUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ blocked: false })
      .eq('id', userId);

    if (error) throw error;
    await fetchUsers();
  };

  const verifyUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ verified: true })
      .eq('id', userId);

    if (error) throw error;
    await fetchUsers();
  };

  return { users, isLoading, error, updateUserRole, blockUser, unblockUser, verifyUser, refetch: fetchUsers };
}

export function useSupabaseUserStats() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    totalAgents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { count: totalUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      const { count: totalAgents } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .in('role', ['agent', 'agency']);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: newUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        totalAgents: totalAgents || 0,
      });
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        totalAgents: 0,
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, error, refetch: fetchStats };
}

function transformBanner(data: any): Banner {
  return {
    id: data.id,
    title: data.title,
    imageUrl: data.image_url,
    link: data.link,
    order: data.order,
    enabled: data.enabled,
    createdAt: new Date(data.created_at),
  };
}

function transformSection(data: any): Section {
  let config = data.config;
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config);
    } catch {
      config = {};
    }
  }
  
  return {
    id: data.id,
    title: data.title,
    type: data.type,
    config: config,
    order: data.order,
    enabled: data.enabled,
    createdAt: new Date(data.created_at),
  };
}
