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
          filter: userId ? `user_id=eq.${userId}` : undefined,
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
        .select(`
          *,
          properties!inner(title, images, agent_id),
          users!inner(name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (agentId) {
        query = query.eq('properties.agent_id', agentId);
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
    try {
      console.log('Creating booking with params:', params);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error. Please log in again.');
      }
      
      if (!session || !session.user) {
        console.error('No session or user found');
        throw new Error('Not authenticated. Please log in.');
      }

      console.log('User authenticated:', session.user.id);

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('agent_id, title')
        .eq('id', params.propertyId)
        .single();

      if (propertyError) {
        console.error('Property fetch error:', propertyError);
        throw new Error('Property not found');
      }

      console.log('Property found:', property.title);

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('name, email, phone')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('User fetch error:', userError);
      }

      console.log('User data:', user);

      const bookingData = {
        property_id: params.propertyId,
        user_id: session.user.id,
        property_title: property.title,
        date: params.visitDate.toISOString().split('T')[0],
        time: params.visitTime,
        client_name: user?.name || 'User',
        client_email: user?.email || session.user.email || '',
        client_phone: user?.phone || '',
        notes: params.notes || null,
        status: 'pending',
      };

      console.log('Inserting booking:', bookingData);

      const { error: insertError, data: insertedBooking } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (insertError) {
        console.error('Create booking error:', insertError);
        throw new Error(insertError.message || 'Failed to create booking');
      }

      console.log('Booking created successfully:', insertedBooking);
      await fetchBookings();
    } catch (error: any) {
      console.error('Create booking error:', error);
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
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
  const images = typeof data.properties?.images === 'string' 
    ? JSON.parse(data.properties.images) 
    : data.properties?.images || [];
  
  return {
    id: data.id,
    propertyId: data.property_id,
    propertyTitle: data.properties?.title || data.property_title || 'Property',
    propertyImage: Array.isArray(images) ? images[0] : '',
    userId: data.user_id,
    userName: data.users?.name || data.client_name || 'User',
    userEmail: data.users?.email || data.client_email || '',
    userPhone: data.users?.phone || data.client_phone || '',
    agentId: data.properties?.agent_id || '',
    agentName: 'Agent',
    visitDate: new Date(data.date),
    visitTime: data.time,
    status: data.status,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.created_at),
  };
}
