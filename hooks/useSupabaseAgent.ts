import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface AgentProfile {
  id: string;
  userId: string;
  companyName?: string;
  bio?: string;
  specialization?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  packageLevel: 'free' | 'pro' | 'agency';
  packageExpiry?: Date;
  areasServed?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManagedProperty {
  id: string;
  agentId: string;
  name: string;
  address: string;
  type: 'Residential' | 'Commercial';
  status: 'Vacant' | 'Occupied' | 'Under Maintenance' | 'For Sale';
  notes?: string;
  images?: string[];
  documents?: string[];
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  tenantMoveInDate?: Date;
  isListed: boolean;
  listedPropertyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffMember {
  id: string;
  agentId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  permissions: string[];
  active: boolean;
  inviteToken?: string;
  inviteExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function useSupabaseAgent(userId?: string) {
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchAgent();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchAgent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setAgent(null);
        } else {
          console.error('Agent fetch error:', fetchError);
          throw new Error(fetchError.message);
        }
      } else {
        setAgent(transformAgent(data));
      }
    } catch (err: any) {
      console.error('Failed to fetch agent:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (params: {
    companyName?: string;
    bio?: string;
    specialization?: string;
    licenseNumber?: string;
    yearsOfExperience?: number;
    areasServed?: string;
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No session found when creating agent profile');
      throw new Error('Not authenticated');
    }

    console.log('Creating agent profile for user:', session.user.id);
    console.log('Agent data:', params);

    const { data: roleUpdate, error: roleError } = await supabase
      .from('users')
      .update({ role: 'agent' })
      .eq('id', session.user.id)
      .select()
      .single();

    if (roleError) {
      console.error('Failed to update user role:', roleError);
      throw new Error('Failed to update user role: ' + roleError.message);
    }

    console.log('User role updated:', roleUpdate);

    const { data: agentData, error } = await supabase.from('agents').insert({
      user_id: session.user.id,
      company_name: params.companyName,
      bio: params.bio,
      specialization: params.specialization,
      license_number: params.licenseNumber,
      years_of_experience: params.yearsOfExperience,
      areas_served: params.areasServed,
      website: params.website,
      facebook: params.facebook,
      twitter: params.twitter,
      instagram: params.instagram,
      linkedin: params.linkedin,
      package_level: 'free',
      rating: 0,
      review_count: 0,
    }).select().single();

    if (error) {
      console.error('Create agent error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error('Cannot create agent profile: ' + error.message);
    }

    console.log('Agent profile created:', agentData);
    await fetchAgent();
  };

  const updateAgent = async (updates: Partial<AgentProfile>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('agents')
      .update({
        company_name: updates.companyName,
        bio: updates.bio,
        specialization: updates.specialization,
        license_number: updates.licenseNumber,
        years_of_experience: updates.yearsOfExperience,
        package_level: updates.packageLevel,
        package_expiry: updates.packageExpiry?.toISOString(),
        areas_served: updates.areasServed,
        website: updates.website,
        facebook: updates.facebook,
        twitter: updates.twitter,
        instagram: updates.instagram,
        linkedin: updates.linkedin,
      })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Update agent error:', error);
      throw new Error(error.message);
    }

    await fetchAgent();
  };

  return { agent, isLoading, error, createAgent, updateAgent, refetch: fetchAgent };
}

export function useSupabaseManagedProperties(agentId?: string) {
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agentId) {
      fetchProperties();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('managed_properties')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Managed properties fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      setProperties(data?.map(transformManagedProperty) || []);
    } catch (err: any) {
      console.error('Failed to fetch managed properties:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createProperty = async (params: Omit<ManagedProperty, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>) => {
    if (!agentId) throw new Error('Agent ID required');

    const { error } = await supabase.from('managed_properties').insert({
      agent_id: agentId,
      name: params.name,
      address: params.address,
      type: params.type,
      status: params.status,
      notes: params.notes,
      images: params.images ? JSON.stringify(params.images) : null,
      documents: params.documents ? JSON.stringify(params.documents) : null,
      tenant_name: params.tenantName,
      tenant_phone: params.tenantPhone,
      tenant_email: params.tenantEmail,
      tenant_move_in_date: params.tenantMoveInDate?.toISOString(),
      is_listed: params.isListed,
      listed_property_id: params.listedPropertyId,
    });

    if (error) {
      console.error('Create managed property error:', error);
      throw new Error(error.message);
    }

    await fetchProperties();
  };

  const updateProperty = async (id: string, updates: Partial<ManagedProperty>) => {
    const { error } = await supabase
      .from('managed_properties')
      .update({
        name: updates.name,
        address: updates.address,
        type: updates.type,
        status: updates.status,
        notes: updates.notes,
        images: updates.images ? JSON.stringify(updates.images) : undefined,
        documents: updates.documents ? JSON.stringify(updates.documents) : undefined,
        tenant_name: updates.tenantName,
        tenant_phone: updates.tenantPhone,
        tenant_email: updates.tenantEmail,
        tenant_move_in_date: updates.tenantMoveInDate?.toISOString(),
        is_listed: updates.isListed,
        listed_property_id: updates.listedPropertyId,
      })
      .eq('id', id);

    if (error) {
      console.error('Update managed property error:', error);
      throw new Error(error.message);
    }

    await fetchProperties();
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase
      .from('managed_properties')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete managed property error:', error);
      throw new Error(error.message);
    }

    await fetchProperties();
  };

  return { properties, isLoading, error, createProperty, updateProperty, deleteProperty, refetch: fetchProperties };
}

export function useSupabaseStaff(agentId?: string) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agentId) {
      fetchStaff();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('staff')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Staff fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      setStaff(data?.map(transformStaff) || []);
    } catch (err: any) {
      console.error('Failed to fetch staff:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addStaff = async (params: Omit<StaffMember, 'id' | 'agentId' | 'createdAt' | 'updatedAt'>) => {
    if (!agentId) throw new Error('Agent ID required');

    const { error } = await supabase.from('staff').insert({
      agent_id: agentId,
      name: params.name,
      role: params.role,
      email: params.email,
      phone: params.phone,
      permissions: JSON.stringify(params.permissions),
      active: params.active,
      invite_token: params.inviteToken,
      invite_expiry: params.inviteExpiry?.toISOString(),
    });

    if (error) {
      console.error('Add staff error:', error);
      throw new Error(error.message);
    }

    await fetchStaff();
  };

  const updateStaff = async (id: string, updates: Partial<StaffMember>) => {
    const { error } = await supabase
      .from('staff')
      .update({
        name: updates.name,
        role: updates.role,
        email: updates.email,
        phone: updates.phone,
        permissions: updates.permissions ? JSON.stringify(updates.permissions) : undefined,
        active: updates.active,
        invite_token: updates.inviteToken,
        invite_expiry: updates.inviteExpiry?.toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Update staff error:', error);
      throw new Error(error.message);
    }

    await fetchStaff();
  };

  const removeStaff = async (id: string) => {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Remove staff error:', error);
      throw new Error(error.message);
    }

    await fetchStaff();
  };

  return { staff, isLoading, error, addStaff, updateStaff, removeStaff, refetch: fetchStaff };
}

function transformAgent(data: any): AgentProfile {
  return {
    id: data.id,
    userId: data.user_id,
    companyName: data.company_name,
    bio: data.bio,
    specialization: data.specialization,
    licenseNumber: data.license_number,
    yearsOfExperience: data.years_of_experience,
    packageLevel: data.package_level,
    packageExpiry: data.package_expiry ? (() => {
      const parsed = new Date(data.package_expiry);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    })() : undefined,
    areasServed: data.areas_served,
    website: data.website,
    facebook: data.facebook,
    twitter: data.twitter,
    instagram: data.instagram,
    linkedin: data.linkedin,
    rating: data.rating,
    reviewCount: data.review_count,
    createdAt: (() => {
      const parsed = new Date(data.created_at);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    })(),
    updatedAt: (() => {
      const parsed = new Date(data.updated_at);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    })(),
  };
}

function transformManagedProperty(data: any): ManagedProperty {
  const parseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined;
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };
  
  return {
    id: data.id,
    agentId: data.agent_id,
    name: data.name,
    address: data.address,
    type: data.type,
    status: data.status,
    notes: data.notes,
    images: data.images ? JSON.parse(data.images) : undefined,
    documents: data.documents ? JSON.parse(data.documents) : undefined,
    tenantName: data.tenant_name,
    tenantPhone: data.tenant_phone,
    tenantEmail: data.tenant_email,
    tenantMoveInDate: parseDate(data.tenant_move_in_date),
    isListed: data.is_listed,
    listedPropertyId: data.listed_property_id,
    createdAt: parseDate(data.created_at) || new Date(),
    updatedAt: parseDate(data.updated_at) || new Date(),
  };
}

function transformStaff(data: any): StaffMember {
  const parseDate = (dateValue: any): Date | undefined => {
    if (!dateValue) return undefined;
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };
  
  return {
    id: data.id,
    agentId: data.agent_id,
    name: data.name,
    role: data.role,
    email: data.email,
    phone: data.phone,
    permissions: data.permissions ? JSON.parse(data.permissions) : [],
    active: data.active,
    inviteToken: data.invite_token,
    inviteExpiry: parseDate(data.invite_expiry),
    createdAt: parseDate(data.created_at) || new Date(),
    updatedAt: parseDate(data.updated_at) || new Date(),
  };
}
