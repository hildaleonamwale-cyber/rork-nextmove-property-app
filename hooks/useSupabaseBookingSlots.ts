import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookingSlot } from '@/types/property';

export function useSupabaseBookingSlots(agentId?: string) {
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agentId) {
      fetchBookingSlots();

      const channel = supabase
        .channel('booking-slots-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'booking_slots',
            filter: `agent_id=eq.${agentId}`,
          },
          () => {
            fetchBookingSlots();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const fetchBookingSlots = async () => {
    if (!agentId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('booking_slots')
        .select('*')
        .eq('agent_id', agentId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (fetchError) {
        console.error('Booking slots fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      const transformed = (data || []).map(transformBookingSlot);
      setBookingSlots(transformed);
    } catch (err: any) {
      console.error('Failed to fetch booking slots:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addBookingSlot = async (slot: Omit<BookingSlot, 'id'>) => {
    if (!agentId) throw new Error('Agent ID is required');

    const { error } = await supabase.from('booking_slots').insert({
      agent_id: agentId,
      date: slot.date.toISOString().split('T')[0],
      start_time: slot.startTime,
      end_time: slot.endTime,
      booked: slot.booked || false,
      booked_by: slot.bookedBy,
      notes: slot.notes,
    });

    if (error) {
      console.error('Add booking slot error:', error);
      throw new Error(error.message);
    }
  };

  const updateBookingSlot = async (id: string, updates: Partial<BookingSlot>) => {
    const updateData: any = {};

    if (updates.date) updateData.date = updates.date.toISOString().split('T')[0];
    if (updates.startTime) updateData.start_time = updates.startTime;
    if (updates.endTime) updateData.end_time = updates.endTime;
    if (updates.booked !== undefined) updateData.booked = updates.booked;
    if (updates.bookedBy) updateData.booked_by = updates.bookedBy;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { error } = await supabase
      .from('booking_slots')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Update booking slot error:', error);
      throw new Error(error.message);
    }
  };

  const deleteBookingSlot = async (id: string) => {
    const { error } = await supabase
      .from('booking_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete booking slot error:', error);
      throw new Error(error.message);
    }
  };

  return {
    bookingSlots,
    isLoading,
    error,
    addBookingSlot,
    updateBookingSlot,
    deleteBookingSlot,
    refetch: fetchBookingSlots,
  };
}

function transformBookingSlot(data: any): BookingSlot {
  const parseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };
  
  return {
    id: data.id,
    date: parseDate(data.date),
    startTime: data.start_time,
    endTime: data.end_time,
    booked: data.booked,
    bookedBy: data.booked_by,
    bookingId: data.booking_id,
    notes: data.notes,
  };
}
