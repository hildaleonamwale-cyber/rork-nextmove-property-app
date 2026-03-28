import { useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { BookingCardData, BookingStatus } from '@/components/BookingCard';
import { useSupabaseBookings } from '@/hooks/useSupabaseBookings';
import { useUser } from './UserContext';

export const [BookingProvider, useBookings] = createContextHook(() => {
  const { user } = useUser();
  const { 
    bookings: supabaseBookings, 
    isLoading, 
    createBooking, 
    updateBookingStatus: updateStatus,
    refetch 
  } = useSupabaseBookings(user?.id);

  const bookings: BookingCardData[] = supabaseBookings.map((booking) => ({
    id: booking.id,
    propertyId: booking.propertyId,
    propertyTitle: booking.propertyTitle,
    propertyImage: booking.propertyImage,
    date: booking.visitDate.toISOString().split('T')[0],
    time: booking.visitTime,
    clientName: booking.userName,
    status: booking.status as BookingStatus,
  }));

  const addBooking = useCallback(async (booking: Omit<BookingCardData, 'id' | 'status'>) => {
    try {
      await createBooking({
        propertyId: booking.propertyId,
        visitDate: new Date(booking.date),
        visitTime: booking.time,
      });
      console.log('Booking added successfully');
    } catch (error) {
      console.error('Failed to add booking:', error);
      throw error;
    }
  }, [createBooking]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
    try {
      await updateStatus(bookingId, status);
      console.log('Booking status updated:', bookingId, status);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      throw error;
    }
  }, [updateStatus]);

  const getBookingById = useCallback((bookingId: string) => {
    return bookings.find((b) => b.id === bookingId);
  }, [bookings]);

  const getBookingsByProperty = useCallback((propertyId: string) => {
    return bookings.filter((b) => b.propertyId === propertyId);
  }, [bookings]);

  return useMemo(
    () => ({
      bookings,
      isLoading,
      loadBookings: refetch,
      addBooking,
      updateBookingStatus,
      getBookingById,
      getBookingsByProperty,
    }),
    [
      bookings,
      isLoading,
      refetch,
      addBooking,
      updateBookingStatus,
      getBookingById,
      getBookingsByProperty,
    ]
  );
});
