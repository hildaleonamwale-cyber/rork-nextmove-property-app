import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Building2,
  Home,
  Search,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAgentProfile } from '@/contexts/AgentProfileContext';
import ManagedPropertyCard from '@/components/ManagedPropertyCard';
import { ManagedPropertyStatus } from '@/types/property';

export default function PropertyManagementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { managedProperties, updateManagedProperty } = useAgentProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ManagedPropertyStatus | 'All'>('All');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const filteredProperties = useMemo(() => {
    let filtered = managedProperties;

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    return filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [managedProperties, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = managedProperties.length;
    const occupied = managedProperties.filter(p => p.status === 'Occupied').length;
    const vacant = managedProperties.filter(p => p.status === 'Vacant').length;
    const listed = managedProperties.filter(p => p.isListed).length;

    return { total, occupied, vacant, listed };
  }, [managedProperties]);

  const handleStatusChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setShowStatusModal(true);
  };

  const updateStatus = async (newStatus: ManagedPropertyStatus) => {
    if (selectedPropertyId) {
      await updateManagedProperty(selectedPropertyId, { status: newStatus });
      setShowStatusModal(false);
      setSelectedPropertyId(null);
    }
  };

  const statusOptions: ManagedPropertyStatus[] = ['Vacant', 'Occupied', 'Under Maintenance', 'For Sale'];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Property Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/agent/add-managed-property' as any)}
        >
          <Plus size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Building2 size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Managed</Text>
          </View>

          <View style={styles.statBox}>
            <Home size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{stats.occupied}</Text>
            <Text style={styles.statLabel}>Occupied</Text>
          </View>

          <View style={styles.statBox}>
            <Home size={20} color='#10B981' />
            <Text style={styles.statValue}>{stats.vacant}</Text>
            <Text style={styles.statLabel}>Vacant</Text>
          </View>

          <View style={styles.statBox}>
            <Home size={20} color={Colors.accent} />
            <Text style={styles.statValue}>{stats.listed}</Text>
            <Text style={styles.statLabel}>Listed</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.text.light} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.text.light}
            />
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === 'All' && styles.filterChipActive
                ]}
                onPress={() => setFilterStatus('All')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'All' && styles.filterChipTextActive
                ]}>
                  All ({managedProperties.length})
                </Text>
              </TouchableOpacity>

              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    filterStatus === status && styles.filterChipActive
                  ]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filterStatus === status && styles.filterChipTextActive
                  ]}>
                    {status} ({managedProperties.filter(p => p.status === status).length})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {filteredProperties.length === 0 ? (
          <View style={styles.emptyState}>
            <Building2 size={64} color={Colors.text.light} />
            <Text style={styles.emptyStateTitle}>
              {searchQuery || filterStatus !== 'All' ? 'No properties found' : 'No managed properties yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterStatus !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Start managing properties by adding your first one'}
            </Text>
            {!searchQuery && filterStatus === 'All' && (
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/agent/add-managed-property' as any)}
              >
                <Plus size={20} color={Colors.white} />
                <Text style={styles.emptyStateButtonText}>Add Property</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.propertiesList}>
            {filteredProperties.map((property) => (
              <ManagedPropertyCard
                key={property.id}
                property={property}
                onPress={() => router.push(`/agent/managed-property-detail/${property.id}` as any)}
                onEdit={() => router.push(`/agent/edit-managed-property/${property.id}` as any)}
                onStatusChange={() => handleStatusChange(property.id)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Status</Text>
            
            <View style={styles.statusOptions}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.statusOption}
                  onPress={() => updateStatus(status)}
                >
                  <Text style={styles.statusOptionText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    minWidth: 150,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center' as const,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    padding: 0,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterChips: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  propertiesList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 100,
  },
  emptyStateButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%' as const,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  statusOptions: {
    gap: 12,
    marginBottom: 20,
  },
  statusOption: {
    backgroundColor: Colors.gray[50],
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 100,
    alignItems: 'center' as const,
  },
  statusOptionText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  modalCancelButton: {
    backgroundColor: Colors.gray[100],
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center' as const,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
  },
});
