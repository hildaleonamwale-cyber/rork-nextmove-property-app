import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Flag,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Home,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

type FlagReason = 'inappropriate' | 'fraud' | 'duplicate' | 'misleading' | 'other';
type FlagStatus = 'pending' | 'resolved' | 'dismissed';

interface PropertyFlag {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  reportedBy: string;
  reporterName: string;
  reason: FlagReason;
  description: string;
  timestamp: string;
  status: FlagStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

const mockFlags: PropertyFlag[] = [
  {
    id: 'f1',
    propertyId: '1',
    propertyTitle: 'Primrose Luxury Apartment',
    propertyImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    reportedBy: 'u5',
    reporterName: 'Jane Cooper',
    reason: 'misleading',
    description: 'The advertised size does not match the actual property size.',
    timestamp: '2025-01-16T10:30:00Z',
    status: 'pending',
  },
  {
    id: 'f2',
    propertyId: '3',
    propertyTitle: 'Downtown Modern Condo',
    propertyImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    reportedBy: 'u6',
    reporterName: 'Robert Fox',
    reason: 'inappropriate',
    description: 'Images contain inappropriate content.',
    timestamp: '2025-01-15T14:22:00Z',
    status: 'pending',
  },
  {
    id: 'f3',
    propertyId: '5',
    propertyTitle: 'Beachfront Villa',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    reportedBy: 'u7',
    reporterName: 'Emily Chen',
    reason: 'fraud',
    description: 'This property does not exist at the listed address.',
    timestamp: '2025-01-14T09:15:00Z',
    status: 'resolved',
    resolvedBy: 'Super Admin',
    resolvedAt: '2025-01-15T11:00:00Z',
    resolutionNotes: 'Property removed after verification. User account suspended.',
  },
];

export default function ContentModeration() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [flags, setFlags] = useState<PropertyFlag[]>(mockFlags);
  const [selectedStatus, setSelectedStatus] = useState<'all' | FlagStatus>('all');
  const [selectedFlag, setSelectedFlag] = useState<PropertyFlag | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredFlags = useMemo(() => {
    if (selectedStatus === 'all') return flags;
    return flags.filter((flag) => flag.status === selectedStatus);
  }, [flags, selectedStatus]);

  const statusCounts = useMemo(() => {
    return {
      all: flags.length,
      pending: flags.filter((f) => f.status === 'pending').length,
      resolved: flags.filter((f) => f.status === 'resolved').length,
      dismissed: flags.filter((f) => f.status === 'dismissed').length,
    };
  }, [flags]);

  const handleViewFlag = (flag: PropertyFlag) => {
    setSelectedFlag(flag);
    setResolutionNotes(flag.resolutionNotes || '');
    setModalVisible(true);
  };

  const handleResolve = (action: 'resolved' | 'dismissed') => {
    if (!selectedFlag) return;

    Alert.alert(
      action === 'resolved' ? 'Resolve Flag' : 'Dismiss Flag',
      `Are you sure you want to ${action === 'resolved' ? 'resolve' : 'dismiss'} this flag?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'resolved' ? 'Resolve' : 'Dismiss',
          onPress: () => {
            setFlags((prev) =>
              prev.map((f) =>
                f.id === selectedFlag.id
                  ? {
                      ...f,
                      status: action,
                      resolvedBy: 'Super Admin',
                      resolvedAt: new Date().toISOString(),
                      resolutionNotes,
                    }
                  : f
              )
            );
            setModalVisible(false);
            setSelectedFlag(null);
            setResolutionNotes('');
          },
        },
      ]
    );
  };

  const getReasonColor = (reason: FlagReason) => {
    switch (reason) {
      case 'fraud':
        return '#EF4444';
      case 'inappropriate':
        return '#F59E0B';
      case 'misleading':
        return '#8B5CF6';
      case 'duplicate':
        return '#3B82F6';
      default:
        return Colors.gray[400];
    }
  };

  const getStatusColor = (status: FlagStatus) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'resolved':
        return '#10B981';
      case 'dismissed':
        return Colors.gray[400];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 60 : insets.top + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Content Moderation</Text>
          <Text style={styles.headerSubtitle}>
            {statusCounts.pending} pending flags
          </Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {(['all', 'pending', 'resolved', 'dismissed'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, selectedStatus === status && styles.filterChipActive]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === status && styles.filterChipTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {filteredFlags.length === 0 ? (
            <View style={styles.emptyState}>
              <Flag size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>No Flags Found</Text>
              <Text style={styles.emptyText}>
                {selectedStatus === 'all'
                  ? 'No flags have been reported yet.'
                  : `No ${selectedStatus} flags found.`}
              </Text>
            </View>
          ) : (
            filteredFlags.map((flag) => (
              <TouchableOpacity
                key={flag.id}
                style={styles.flagCard}
                onPress={() => handleViewFlag(flag)}
              >
                <View style={styles.flagHeader}>
                  <Image source={{ uri: flag.propertyImage }} style={styles.flagImage} />
                  <View style={styles.flagInfo}>
                    <Text style={styles.flagTitle} numberOfLines={1}>
                      {flag.propertyTitle}
                    </Text>
                    <View style={styles.flagMeta}>
                      <View style={styles.metaBadge}>
                        <Flag size={12} color={getReasonColor(flag.reason)} />
                        <Text
                          style={[
                            styles.metaBadgeText,
                            { color: getReasonColor(flag.reason) },
                          ]}
                        >
                          {flag.reason}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusColor(flag.status)}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: getStatusColor(flag.status) },
                          ]}
                        >
                          {flag.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.reporterInfo}>
                      <User size={12} color={Colors.text.secondary} />
                      <Text style={styles.reporterText}>{flag.reporterName}</Text>
                      <Clock size={12} color={Colors.text.secondary} />
                      <Text style={styles.timeText}>{formatDate(flag.timestamp)}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.flagDescription} numberOfLines={2}>
                  {flag.description}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedFlag && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <Flag size={24} color={getReasonColor(selectedFlag.reason)} />
                    <Text style={styles.modalTitle}>Flag Details</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeText}>Close</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Image
                    source={{ uri: selectedFlag.propertyImage }}
                    style={styles.modalPropertyImage}
                  />

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Property</Text>
                    <Text style={styles.detailValue}>{selectedFlag.propertyTitle}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Reported By</Text>
                    <Text style={styles.detailValue}>{selectedFlag.reporterName}</Text>
                    <Text style={styles.detailSubtext}>User ID: {selectedFlag.reportedBy}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Reason</Text>
                    <View
                      style={[
                        styles.reasonBadge,
                        { backgroundColor: `${getReasonColor(selectedFlag.reason)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.reasonBadgeText,
                          { color: getReasonColor(selectedFlag.reason) },
                        ]}
                      >
                        {selectedFlag.reason.charAt(0).toUpperCase() + selectedFlag.reason.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{selectedFlag.description}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Reported On</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedFlag.timestamp)}</Text>
                  </View>

                  {selectedFlag.status !== 'pending' && selectedFlag.resolvedAt && (
                    <>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Resolved By</Text>
                        <Text style={styles.detailValue}>{selectedFlag.resolvedBy}</Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Resolved On</Text>
                        <Text style={styles.detailValue}>{formatDate(selectedFlag.resolvedAt)}</Text>
                      </View>

                      {selectedFlag.resolutionNotes && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Resolution Notes</Text>
                          <Text style={styles.detailValue}>{selectedFlag.resolutionNotes}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {selectedFlag.status === 'pending' && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Resolution Notes</Text>
                      <TextInput
                        style={styles.notesInput}
                        placeholder="Add notes about your decision..."
                        placeholderTextColor={Colors.text.secondary}
                        value={resolutionNotes}
                        onChangeText={setResolutionNotes}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.viewPropertyBtn}
                    onPress={() => {
                      setModalVisible(false);
                      router.push(`/property/${selectedFlag.propertyId}` as any);
                    }}
                  >
                    <Home size={18} color={Colors.white} />
                    <Text style={styles.viewPropertyBtnText}>View Property</Text>
                  </TouchableOpacity>
                  {selectedFlag.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.dismissBtn}
                        onPress={() => handleResolve('dismissed')}
                      >
                        <XCircle size={18} color={Colors.white} />
                        <Text style={styles.dismissBtnText}>Dismiss</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.resolveBtn}
                        onPress={() => handleResolve('resolved')}
                      >
                        <CheckCircle2 size={18} color={Colors.white} />
                        <Text style={styles.resolveBtnText}>Resolve</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    maxWidth: 280,
  },
  flagCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  flagHeader: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 12,
  },
  flagImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
  },
  flagInfo: {
    flex: 1,
  },
  flagTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  flagMeta: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 8,
  },
  metaBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  reporterInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  reporterText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  flagDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%' as const,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalPropertyImage: {
    width: '100%' as const,
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  detailSubtext: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  reasonBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  reasonBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  notesInput: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    minHeight: 100,
    outlineStyle: 'none' as const,
  },
  modalFooter: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  viewPropertyBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  viewPropertyBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  dismissBtn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.gray[600],
    borderRadius: 12,
  },
  dismissBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  resolveBtn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  resolveBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
