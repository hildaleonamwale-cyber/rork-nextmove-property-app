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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  X,
  Download,
  Flag,
  MapPin,
  Calendar,
} from 'lucide-react-native';
import { mockProperties } from '@/mocks/properties';
import Colors from '@/constants/colors';
import type { Property } from '@/types/property';

type PropertyWithFlags = Property & {
  flagCount?: number;
  dateAdded?: string;
};

export default function PropertyManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    type: [] as string[],
    location: [] as string[],
    status: [] as string[],
    packageLevel: [] as string[],
    flagged: null as boolean | null,
    minPrice: '',
    maxPrice: '',
    minBookings: '',
    maxBookings: '',
    dateFrom: '',
    dateTo: '',
  });

  const [sortBy, setSortBy] = useState<'date' | 'price' | 'views' | 'bookings'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const mockPropertiesWithData: PropertyWithFlags[] = mockProperties.map((p, i) => ({
    ...p,
    flagCount: i === 0 ? 3 : i === 2 ? 1 : 0,
    dateAdded: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  }));

  const filteredProperties = useMemo(() => {
    return mockPropertiesWithData.filter((property) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !property.title.toLowerCase().includes(query) &&
          !property.location.city.toLowerCase().includes(query) &&
          !property.location.address.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (filters.type.length > 0 && !filters.type.includes(property.propertyType)) {
        return false;
      }

      if (filters.location.length > 0 && !filters.location.includes(property.location.city)) {
        return false;
      }

      if (filters.status.length > 0 && !filters.status.includes(property.status)) {
        return false;
      }

      if (filters.flagged !== null) {
        const hasFlags = (property.flagCount ?? 0) > 0;
        if (filters.flagged !== hasFlags) {
          return false;
        }
      }

      if (filters.minPrice && property.price < parseFloat(filters.minPrice)) {
        return false;
      }

      if (filters.maxPrice && property.price > parseFloat(filters.maxPrice)) {
        return false;
      }

      if (filters.minBookings && property.bookings < parseInt(filters.minBookings)) {
        return false;
      }

      if (filters.maxBookings && property.bookings > parseInt(filters.maxBookings)) {
        return false;
      }

      if (filters.dateFrom && property.dateAdded) {
        if (new Date(property.dateAdded) < new Date(filters.dateFrom)) {
          return false;
        }
      }

      if (filters.dateTo && property.dateAdded) {
        if (new Date(property.dateAdded) > new Date(filters.dateTo)) {
          return false;
        }
      }

      return true;
    });
  }, [mockPropertiesWithData, searchQuery, filters]);

  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties];
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.dateAdded || '').getTime() - new Date(a.dateAdded || '').getTime();
          break;
        case 'price':
          comparison = b.price - a.price;
          break;
        case 'views':
          comparison = b.views - a.views;
          break;
        case 'bookings':
          comparison = b.bookings - a.bookings;
          break;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });
    return sorted;
  }, [filteredProperties, sortBy, sortOrder]);

  const toggleSelectProperty = (id: string) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map((p) => p.id));
    }
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete:', selectedProperties);
    setSelectedProperties([]);
  };

  const handleExport = () => {
    console.log('Export properties:', filters);
  };

  const resetFilters = () => {
    setFilters({
      type: [],
      location: [],
      status: [],
      packageLevel: [],
      flagged: null,
      minPrice: '',
      maxPrice: '',
      minBookings: '',
      maxBookings: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const availableCities = useMemo(() => {
    return Array.from(new Set(mockPropertiesWithData.map((p) => p.location.city)));
  }, [mockPropertiesWithData]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type.length > 0) count++;
    if (filters.location.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.packageLevel.length > 0) count++;
    if (filters.flagged !== null) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.minBookings) count++;
    if (filters.maxBookings) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  const toggleFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const currentArray = prev[key] as string[];
      if (currentArray.includes(value)) {
        return { ...prev, [key]: currentArray.filter((v) => v !== value) };
      } else {
        return { ...prev, [key]: [...currentArray, value] };
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 60 : insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Property Management</Text>
            <Text style={styles.headerSubtitle}>
              {filteredProperties.length} of {mockPropertiesWithData.length} properties
            </Text>
          </View>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ifbay395j090acyodisqd' }} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, location, or address..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.secondary}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters(true)}
        >
          <Filter size={20} color={activeFilterCount > 0 ? Colors.white : Colors.text.primary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Download size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
          {(['date', 'price', 'views', 'bookings'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortBtn, sortBy === option && styles.sortBtnActive]}
              onPress={() => {
                if (sortBy === option) {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy(option);
                  setSortOrder('desc');
                }
              }}
            >
              <Text style={[styles.sortBtnText, sortBy === option && styles.sortBtnTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
              {sortBy === option && (
                <Text style={styles.sortArrow}>{sortOrder === 'asc' ? '↑' : '↓'}</Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersLabel}>Active filters:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
            {filters.type.map((t) => (
              <View key={`type-${t}`} style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{t}</Text>
                <TouchableOpacity onPress={() => toggleFilter('type', t)}>
                  <X size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
            {filters.location.map((l) => (
              <View key={`location-${l}`} style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{l}</Text>
                <TouchableOpacity onPress={() => toggleFilter('location', l)}>
                  <X size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
            {filters.status.map((s) => (
              <View key={`status-${s}`} style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{s}</Text>
                <TouchableOpacity onPress={() => toggleFilter('status', s)}>
                  <X size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
            {filters.flagged !== null && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {filters.flagged ? 'Flagged' : 'Not Flagged'}
                </Text>
                <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, flagged: null }))}>
                  <X size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                </Text>
                <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }))}>
                  <X size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {filters.dateFrom || 'Start'} → {filters.dateTo || 'End'}
                </Text>
                <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }))}>
                  <X size={14} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.clearAllFilters} onPress={resetFilters}>
              <Text style={styles.clearAllFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {selectedProperties.length > 0 && (
        <View style={styles.bulkActions}>
          <Text style={styles.bulkActionsText}>{selectedProperties.length} selected</Text>
          <View style={styles.bulkActionsButtons}>
            <TouchableOpacity style={styles.bulkBtn} onPress={() => setSelectedProperties([])}>
              <Text style={styles.bulkBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bulkBtn, styles.bulkBtnDanger]} onPress={handleBulkDelete}>
              <Trash2 size={16} color={Colors.white} />
              <Text style={[styles.bulkBtnText, { color: Colors.white }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.selectAllContainer}>
        <TouchableOpacity style={styles.selectAllBtn} onPress={toggleSelectAll}>
          {selectedProperties.length === filteredProperties.length && filteredProperties.length > 0 ? (
            <CheckSquare size={20} color={Colors.primary} />
          ) : (
            <Square size={20} color={Colors.text.secondary} />
          )}
          <Text style={styles.selectAllText}>Select All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {sortedProperties.map((property) => (
            <View key={property.id} style={styles.propertyCard}>
              <TouchableOpacity
                style={styles.selectCheckbox}
                onPress={() => toggleSelectProperty(property.id)}
              >
                {selectedProperties.includes(property.id) ? (
                  <CheckSquare size={24} color={Colors.primary} />
                ) : (
                  <Square size={24} color={Colors.text.secondary} />
                )}
              </TouchableOpacity>

              {(property.flagCount ?? 0) > 0 && (
                <View style={styles.flagBadge}>
                  <Flag size={12} color={Colors.white} />
                  <Text style={styles.flagBadgeText}>{property.flagCount}</Text>
                </View>
              )}

              <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle} numberOfLines={2}>
                  {property.title}
                </Text>
                
                <View style={styles.propertyMeta}>
                  <View style={styles.metaRow}>
                    <MapPin size={14} color={Colors.text.secondary} />
                    <Text style={styles.metaText}>
                      {property.location.city}, {property.location.country}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Calendar size={14} color={Colors.text.secondary} />
                    <Text style={styles.metaText}>Added {property.dateAdded}</Text>
                  </View>
                </View>

                <View style={styles.propertyStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Price</Text>
                    <Text style={styles.statValue}>
                      ${property.price.toLocaleString()}{property.priceType === 'monthly' ? '/mo' : ''}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Views</Text>
                    <Text style={styles.statValue}>{property.views.toLocaleString()}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Bookings</Text>
                    <Text style={styles.statValue}>{property.bookings}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Status</Text>
                    <Text style={[styles.statValue, styles.statusText]}>{property.status}</Text>
                  </View>
                </View>

                <View style={styles.propertyActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPrimary]}
                    onPress={() => router.push(`/property/${property.id}` as any)}
                  >
                    <Eye size={16} color={Colors.white} />
                    <Text style={styles.actionBtnText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.actionBtnSecondary]}
                    onPress={() => router.push(`/agent/add-property?id=${property.id}` as any)}
                  >
                    <Edit2 size={16} color={Colors.primary} />
                    <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]}>
                    <Trash2 size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Property Type</Text>
                <View style={styles.filterOptions}>
                  {['apartment', 'house', 'villa', 'condo'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterChip,
                        filters.type.includes(type) && styles.filterChipActive,
                      ]}
                      onPress={() => toggleFilter('type', type)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.type.includes(type) && styles.filterChipTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <View style={styles.filterOptions}>
                  {availableCities.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={[
                        styles.filterChip,
                        filters.location.includes(city) && styles.filterChipActive,
                      ]}
                      onPress={() => toggleFilter('location', city)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.location.includes(city) && styles.filterChipTextActive,
                        ]}
                      >
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.filterOptions}>
                  {['For Rent', 'For Sale', 'Internal Management'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        filters.status.includes(status) && styles.filterChipActive,
                      ]}
                      onPress={() => toggleFilter('status', status)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          filters.status.includes(status) && styles.filterChipTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Flagged Content</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.flagged === true && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, flagged: prev.flagged === true ? null : true }))
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.flagged === true && styles.filterChipTextActive,
                      ]}
                    >
                      Flagged Only
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      filters.flagged === false && styles.filterChipActive,
                    ]}
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, flagged: prev.flagged === false ? null : false }))
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.flagged === false && styles.filterChipTextActive,
                      ]}
                    >
                      Not Flagged
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    value={filters.minPrice}
                    onChangeText={(text) => setFilters((prev) => ({ ...prev, minPrice: text }))}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.text.secondary}
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChangeText={(text) => setFilters((prev) => ({ ...prev, maxPrice: text }))}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.text.secondary}
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Bookings Range</Text>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    value={filters.minBookings}
                    onChangeText={(text) => setFilters((prev) => ({ ...prev, minBookings: text }))}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.text.secondary}
                  />
                  <Text style={styles.rangeSeparator}>-</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    value={filters.maxBookings}
                    onChangeText={(text) => setFilters((prev) => ({ ...prev, maxBookings: text }))}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.text.secondary}
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Date Range</Text>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="From (YYYY-MM-DD)"
                    value={filters.dateFrom}
                    onChangeText={(text) => setFilters((prev) => ({ ...prev, dateFrom: text }))}
                    placeholderTextColor={Colors.text.secondary}
                  />
                  <Text style={styles.rangeSeparator}>→</Text>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="To (YYYY-MM-DD)"
                    value={filters.dateTo}
                    onChangeText={(text) => setFilters((prev) => ({ ...prev, dateTo: text }))}
                    placeholderTextColor={Colors.text.secondary}
                  />
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={resetFilters}>
                <Text style={styles.modalBtnSecondaryText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={() => setShowFilters(false)}>
                <Text style={styles.modalBtnPrimaryText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
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
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  headerTextContainer: {
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    height: '100%' as const,
  },
  filterBtn: {
    width: 48,
    height: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    position: 'relative' as const,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
  filterBadge: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  exportBtn: {
    width: 48,
    height: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  bulkActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + '30',
  },
  bulkActionsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  bulkActionsButtons: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  bulkBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  bulkBtnDanger: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  bulkBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  selectAllContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  selectAllBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden' as const,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative' as const,
  },
  selectCheckbox: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    zIndex: 10,
    backgroundColor: Colors.white,
    borderRadius: 6,
    padding: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flagBadge: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  flagBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  propertyImage: {
    width: '100%' as const,
    height: 200,
    backgroundColor: Colors.gray[200],
  },
  propertyInfo: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  propertyMeta: {
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  propertyStats: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 16,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  statItem: {
    flex: 1,
    minWidth: 70,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginBottom: 2,
    textTransform: 'uppercase' as const,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statusText: {
    fontSize: 13,
  },
  propertyActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  actionBtnSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionBtnDanger: {
    backgroundColor: Colors.error,
    maxWidth: 50,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
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
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  rangeInputs: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text.primary,
    backgroundColor: Colors.white,
  },
  rangeSeparator: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  modalFooter: {
    flexDirection: 'row' as const,
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  modalBtnSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  modalBtnPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  sortContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginRight: 12,
  },
  sortScroll: {
    flex: 1,
  },
  sortBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    marginRight: 8,
    gap: 4,
  },
  sortBtnActive: {
    backgroundColor: Colors.primary,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  sortBtnTextActive: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  sortArrow: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  activeFiltersContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + '20',
  },
  activeFiltersLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginRight: 8,
  },
  activeFiltersScroll: {
    flex: 1,
  },
  activeFilterChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  clearAllFilters: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.error + '15',
  },
  clearAllFiltersText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.error,
  },
});
