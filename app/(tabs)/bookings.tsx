import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Calendar, MapPin, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';
import SuccessPrompt from '@/components/SuccessPrompt';
import UniformHeader from '@/components/UniformHeader';
import ConfirmDialog from '@/components/ConfirmDialog';
import DateTimePickerModal from '@/components/DateTimePickerModal';
import { useSupabaseBookings } from '@/hooks/useSupabaseBookings';
import { useUser } from '@/contexts/UserContext';
import LoginPrompt from '@/components/LoginPrompt';

interface Booking {
  id: string;
  propertyName: string;
  location: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function BookingsScreen() {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isLoading: userLoading } = useUser();
  const { bookings: allBookings, isLoading: isFetching, updateBookingStatus, refetch } = useSupabaseBookings(user?.id);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [selectedPropertyName, setSelectedPropertyName] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(new Date());

  const bookings = allBookings.map(b => ({
    id: b.id,
    propertyName: b.propertyTitle || 'Property',
    location: '',
    date: b.visitDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }),
    time: b.visitTime,
    status: (b.status === 'pending' || b.status === 'confirmed' ? 'upcoming' : b.status) as 'upcoming' | 'completed' | 'cancelled',
  }));

  const filteredBookings = bookings.filter(booking =>
    selectedTab === 'upcoming' ? booking.status === 'upcoming' : booking.status !== 'upcoming'
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleReschedule = useCallback((bookingId: string, propertyName: string) => {
    setSelectedBookingId(bookingId);
    setSelectedPropertyName(propertyName);
    setRescheduleDate(new Date());
    setShowDatePicker(true);
  }, []);

  const handleDateConfirm = useCallback((date: Date) => {
    setRescheduleDate(date);
    setShowDatePicker(false);
    setShowTimePicker(true);
  }, []);

  const handleTimeConfirm = useCallback((date: Date) => {
    setRescheduleDate(date);
    setShowTimePicker(false);
    setSuccessMessage(`Successfully Rescheduled ${selectedPropertyName}`);
    setShowSuccess(true);
  }, [selectedPropertyName]);

  const handleBookTour = useCallback(() => {
    console.log('Booking new tour');
    setSuccessMessage('Tour Booked Successfully');
    setShowSuccess(true);
  }, []);

  const handleCancelClick = useCallback((bookingId: string, propertyName: string) => {
    setSelectedBookingId(bookingId);
    setSelectedPropertyName(propertyName);
    setShowCancelDialog(true);
  }, []);

  const handleCancelConfirm = useCallback(async () => {
    if (selectedBookingId) {
      try {
        await updateBookingStatus(selectedBookingId, 'cancelled');
        setShowCancelDialog(false);
        setSuccessMessage(`Successfully Cancelled ${selectedPropertyName}`);
        setShowSuccess(true);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  }, [selectedPropertyName, selectedBookingId, updateBookingStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return Colors.primary;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.text.secondary;
    }
  };

  if (!user && !userLoading) {
    return (
      <View style={styles.container}>
        <UniformHeader title="Bookings" showBorder={false} />
        <LoginPrompt 
          message="Please log in to view and manage your property viewing bookings"
          icon={Calendar}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UniformHeader 
        title="Bookings"
        showBorder={false}
      />
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
            onPress={() => setSelectedTab('upcoming')}
          >
            <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'past' && styles.tabActive]}
            onPress={() => setSelectedTab('past')}
          >
            <Text style={[styles.tabText, selectedTab === 'past' && styles.tabTextActive]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        style={styles.content}
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item: booking }) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.propertyName}>{booking.propertyName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}15` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={18} color={Colors.text.secondary} />
                  <Text style={styles.detailText}>{booking.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={18} color={Colors.text.secondary} />
                  <Text style={styles.detailText}>{booking.date}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={18} color={Colors.text.secondary} />
                  <Text style={styles.detailText}>{booking.time}</Text>
                </View>
              </View>

              {booking.status === 'upcoming' && (
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => handleCancelClick(booking.id, booking.propertyName)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rescheduleButton}
                    onPress={() => handleReschedule(booking.id, booking.propertyName)}
                  >
                    <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'upcoming' ? 'Schedule a viewing to get started' : 'Your past bookings will appear here'}
            </Text>
            <TouchableOpacity 
              style={styles.bookTourButton}
              onPress={handleBookTour}
            >
              <Text style={styles.bookTourText}>Book a Tour</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={<View style={{ height: 20 }} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <SuccessPrompt
        visible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />

      <ConfirmDialog
        visible={showCancelDialog}
        title="Cancel Booking"
        message={`Are you sure you want to cancel your booking for ${selectedPropertyName}?`}
        confirmText="Yes, Cancel"
        cancelText="No"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelDialog(false)}
        confirmColor={Colors.error}
      />

      <DateTimePickerModal
        visible={showDatePicker}
        mode="date"
        value={rescheduleDate}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />

      <DateTimePickerModal
        visible={showTimePicker}
        mode="time"
        value={rescheduleDate}
        onConfirm={handleTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabsContainer: {
    paddingHorizontal: DesignSystem.contentPadding,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  tabs: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 14,
    padding: 4,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: DesignSystem.contentPadding,
    backgroundColor: '#FFFFFF',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.card.borderRadius,
    padding: DesignSystem.card.padding,
    marginBottom: DesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...DesignSystem.card.shadow,
  },
  bookingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 14,
  },
  propertyName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  bookingDetails: {
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  detailText: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  actions: {
    flexDirection: 'row' as const,
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
  },
  rescheduleButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  bookTourButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookTourText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
