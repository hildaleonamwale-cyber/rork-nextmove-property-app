import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ManagedPropertyStatus, ManagedPropertyType } from '@/types/property';

export interface ManagedProperty {
  id: string;
  agentId: string;
  name: string;
  address: string;
  type: ManagedPropertyType;
  status: ManagedPropertyStatus;
  notes?: string;
  images: string[];
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

export function useSupabaseManagedProperties(agentId?: string) {
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) {
      setProperties([]);
      setIsLoading(false);
      return;
    }

    fetchProperties();
    const channel = supabase
      .channel('managed_properties_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'managed_properties',
          filter: `agent_id=eq.${agentId}`,
        },
        () => {
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const fetchProperties = async () => {
    if (!agentId) {
      setProperties([]);
      setIsLoading(false);
      return;
    }

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

      setProperties(data?.map(transformProperty) || []);
    } catch (err: any) {
      console.error('Failed to fetch managed properties:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addProperty = async (params: {
    name: string;
    address: string;
    type: ManagedPropertyType;
    status: ManagedPropertyStatus;
    notes?: string;
    images?: string[];
    tenantName?: string;
    tenantPhone?: string;
    tenantEmail?: string;
    isListed: boolean;
  }) => {
    if (!agentId) throw new Error('No agent ID');

    const { error } = await supabase.from('managed_properties').insert({
      agent_id: agentId,
      name: params.name,
      address: params.address,
      type: params.type,
      status: params.status,
      notes: params.notes,
      images: params.images ? JSON.stringify(params.images) : null,
      tenant_name: params.tenantName,
      tenant_phone: params.tenantPhone,
      tenant_email: params.tenantEmail,
      is_listed: params.isListed,
    });

    if (error) {
      console.error('Add managed property error:', error);
      throw new Error(error.message);
    }

    await fetchProperties();
  };

  const updateProperty = async (id: string, updates: Partial<ManagedProperty>) => {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.images !== undefined) updateData.images = JSON.stringify(updates.images);
    if (updates.tenantName !== undefined) updateData.tenant_name = updates.tenantName;
    if (updates.tenantPhone !== undefined) updateData.tenant_phone = updates.tenantPhone;
    if (updates.tenantEmail !== undefined) updateData.tenant_email = updates.tenantEmail;
    if (updates.isListed !== undefined) updateData.is_listed = updates.isListed;

    const { error } = await supabase
      .from('managed_properties')
      .update(updateData)
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

  return { properties, isLoading, error, addProperty, updateProperty, deleteProperty, refetch: fetchProperties };
}

function transformProperty(data: any): ManagedProperty {
  let images: string[] = [];
  if (data.images) {
    try {
      images = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
    } catch {
      images = [];
    }
  }

  let documents: string[] = [];
  if (data.documents) {
    try {
      documents = typeof data.documents === 'string' ? JSON.parse(data.documents) : data.documents;
    } catch {
      documents = [];
    }
  }

  return {
    id: data.id,
    agentId: data.agent_id,
    name: data.name,
    address: data.address,
    type: data.type,
    status: data.status,
    notes: data.notes,
    images,
    documents,
    tenantName: data.tenant_name,
    tenantPhone: data.tenant_phone,
    tenantEmail: data.tenant_email,
    tenantMoveInDate: data.tenant_move_in_date ? (() => {
      const parsed = new Date(data.tenant_move_in_date);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    })() : undefined,
    isListed: data.is_listed,
    listedPropertyId: data.listed_property_id,
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
