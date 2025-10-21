import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  agentId: string;
  agentName: string;
  visitDate: Date;
  visitTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useSupabaseBookings(userId?: string, agentId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: userId ? `user_id=eq.${userId}` : agentId ? `agent_id=eq.${agentId}` : undefined,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, agentId]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('bookings')
        .select('*, properties(title, images), users(name, email, phone), agents!agent_id(user_id, company_name)')
        .order('visit_date', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Bookings fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      setBookings(data?.map(transformBooking) || []);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createBooking = async (params: {
    propertyId: string;
    visitDate: Date;
    visitTime: string;
    notes?: string;
  }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('agent_id')
      .eq('id', params.propertyId)
      .single();

    if (propertyError) throw new Error('Property not found');

    const { error } = await supabase.from('bookings').insert({
      property_id: params.propertyId,
      user_id: session.user.id,
      agent_id: property.agent_id,
      visit_date: params.visitDate.toISOString(),
      visit_time: params.visitTime,
      notes: params.notes,
      status: 'pending',
    });

    if (error) {
      console.error('Create booking error:', error);
      throw new Error(error.message);
    }

    await fetchBookings();
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) {
      console.error('Update booking error:', error);
      throw new Error(error.message);
    }

    await fetchBookings();
  };

  return { bookings, isLoading, error, createBooking, updateBookingStatus, refetch: fetchBookings };
}

function transformBooking(data: any): Booking {
  return {
    id: data.id,
    propertyId: data.property_id,
    propertyTitle: data.properties?.title || 'Property',
    propertyImage: data.properties?.images?.[0] || '',
    userId: data.user_id,
    userName: data.users?.name || 'User',
    userEmail: data.users?.email || '',
    userPhone: data.users?.phone || '',
    agentId: data.agent_id,
    agentName: data.agents?.company_name || 'Agent',
    visitDate: new Date(data.visit_date),
    visitTime: data.visit_time,
    status: data.status,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
