import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import ConfirmDialog from './ConfirmDialog';
import { useUserMode } from '@/contexts/UserModeContext';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingCardData {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  date: string;
  time: string;
  clientName: string;
  status: BookingStatus;
}

interface BookingCardProps {
  booking: BookingCardData;
  onStatusChange?: (bookingId: string, newStatus: BookingStatus) => void;
}

export default function BookingCard({ booking, onStatusChange }: BookingCardProps) {
  const { isAgent } = useUserMode();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    onStatusChange?.(booking.id, 'confirmed');
  };

  const handleCancel = () => {
    setShowCancelDialog(false);
    onStatusChange?.(booking.id, 'cancelled');
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'confirmed':
        return (
          <View style={[styles.statusBadge, styles.confirmedBadge]}>
            <CheckCircle2 size={14} color={Colors.white} strokeWidth={2.5} />
            <Text style={styles.statusText}>✅ Booking Confirmed</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View style={[styles.statusBadge, styles.cancelledBadge]}>
            <XCircle size={14} color={Colors.white} strokeWidth={2.5} />
            <Text style={styles.statusText}>❌ Booking Canceled</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Calendar size={14} color={Colors.white} strokeWidth={2.5} />
            <Text style={styles.statusText}>Pending Confirmation</Text>
          </View>
        );
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Calendar size={18} color={Colors.primary} strokeWidth={2.5} />
          <Text style={styles.headerTitle}>Property Viewing</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.propertySection}>
            <Image source={{ uri: booking.propertyImage }} style={styles.propertyImage} />
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyTitle} numberOfLines={2}>
                {booking.propertyTitle}
              </Text>
              <Text style={styles.clientName}>Client: {booking.clientName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{booking.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{booking.time}</Text>
            </View>
          </View>

          <View style={styles.statusContainer}>{getStatusBadge()}</View>

          {isAgent && booking.status === 'pending' && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => setShowConfirmDialog(true)}
              >
                <CheckCircle2 size={18} color={Colors.white} strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>Confirm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setShowCancelDialog(true)}
              >
                <XCircle size={18} color={Colors.white} strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ConfirmDialog
        visible={showConfirmDialog}
        title="Confirm Booking"
        message="Are you sure you want to confirm this booking?"
        confirmText="Yes, Confirm"
        cancelText="No"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmDialog(false)}
        confirmColor={Colors.success}
      />

      <ConfirmDialog
        visible={showCancelDialog}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        confirmText="Yes, Cancel"
        cancelText="No"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
        confirmColor={Colors.error}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 8,
    overflow: 'hidden' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: `${Colors.primary}08`,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  content: {
    padding: 16,
  },
  propertySection: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
  },
  propertyInfo: {
    flex: 1,
    justifyContent: 'center' as const,
    gap: 6,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  clientName: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 14,
  },
  detailsSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statusContainer: {
    marginTop: 14,
  },
  statusBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  pendingBadge: {
    backgroundColor: Colors.accent,
  },
  confirmedBadge: {
    backgroundColor: Colors.success,
  },
  cancelledBadge: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  actionsContainer: {
    flexDirection: 'row' as const,
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
