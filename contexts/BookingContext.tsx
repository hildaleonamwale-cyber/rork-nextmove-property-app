import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookingCardData, BookingStatus } from '@/components/BookingCard';

const BOOKINGS_KEY = '@chat_bookings';

export const [BookingProvider, useBookings] = createContextHook(() => {
  const [bookings, setBookings] = useState<BookingCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(BOOKINGS_KEY);
      if (stored) {
        setBookings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveBookings = useCallback(async (newBookings: BookingCardData[]) => {
    try {
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(newBookings));
      setBookings(newBookings);
    } catch (error) {
      console.error('Failed to save bookings:', error);
    }
  }, []);

  const addBooking = useCallback(
    async (booking: Omit<BookingCardData, 'id' | 'status'>) => {
      const newBooking: BookingCardData = {
        ...booking,
        id: Date.now().toString(),
        status: 'pending',
      };
      const updated = [...bookings, newBooking];
      await saveBookings(updated);
      console.log('Booking added:', newBooking);
      return newBooking;
    },
    [bookings, saveBookings]
  );

  const updateBookingStatus = useCallback(
    async (bookingId: string, status: BookingStatus) => {
      const updated = bookings.map((b) =>
        b.id === bookingId ? { ...b, status } : b
      );
      await saveBookings(updated);
      console.log('Booking status updated:', bookingId, status);
    },
    [bookings, saveBookings]
  );

  const getBookingById = useCallback(
    (bookingId: string) => {
      return bookings.find((b) => b.id === bookingId);
    },
    [bookings]
  );

  const getBookingsByProperty = useCallback(
    (propertyId: string) => {
      return bookings.filter((b) => b.propertyId === propertyId);
    },
    [bookings]
  );

  return useMemo(
    () => ({
      bookings,
      isLoading,
      loadBookings,
      addBooking,
      updateBookingStatus,
      getBookingById,
      getBookingsByProperty,
    }),
    [
      bookings,
      isLoading,
      loadBookings,
      addBooking,
      updateBookingStatus,
      getBookingById,
      getBookingsByProperty,
    ]
  );
});
