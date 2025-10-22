import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, SlidersHorizontal, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { mockListings } from '@/mocks/properties';
import PropertyCard from '@/components/PropertyCard';
import StandCard from '@/components/StandCard';
import CommercialPropertyCard from '@/components/CommercialPropertyCard';
import RoomCard from '@/components/RoomCard';
import { Listing, ListingCategory } from '@/types/property';
import { useSupabaseProperties } from '@/hooks/useSupabaseProperties';

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const searchParams = useMemo(() => {
    const query: any = {
      limit: 50,
    };

    if (params.listingCategory) {
      query.listingCategory = params.listingCategory as ListingCategory;
    }

    if (params.transactionType) {
      const status = params.transactionType === 'rent' ? 'For Rent' : 'For Sale';
      query.status = [status];
    }

    if (params.propertyType) {
      query.propertyType = params.propertyType as string;
    }

    if (params.priceMin) {
      query.minPrice = Number(params.priceMin);
    }

    if (params.priceMax) {
      query.maxPrice = Number(params.priceMax);
    }

    if (params.bedrooms) {
      query.bedrooms = Number(params.bedrooms);
    }

    if (params.bathrooms) {
      query.bathrooms = Number(params.bathrooms);
    }

    if (params.city) {
      query.city = params.city as string;
    } else if (params.province) {
      query.location = params.province as string;
    }

    if (params.query) {
      query.location = params.query as string;
    }

    return query;
  }, [params]);

  const { properties: searchData, isLoading } = useSupabaseProperties(searchParams);

  const filters = ['All', 'For Rent', 'For Sale', 'Properties', 'Stands', 'Rooms', 'Commercial'];

  const allProperties = searchData || [];

  const filteredProperties = useMemo(() => {
    return allProperties.filter((listing: any) => {
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'For Rent') return listing.status === 'For Rent';
      if (selectedFilter === 'For Sale') return listing.status === 'For Sale';
      if (selectedFilter === 'Properties') return listing.listingCategory === 'property';
      if (selectedFilter === 'Stands') return listing.listingCategory === 'stand';
      if (selectedFilter === 'Rooms') return listing.listingCategory === 'room';
      if (selectedFilter === 'Commercial') return listing.listingCategory === 'commercial';
      return true;
    });
  }, [allProperties, selectedFilter]);

  const locationLabel = params.city || params.province || params.query || 'All Locations';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Search Results</Text>
            {locationLabel && (
              <View style={styles.locationRow}>
                <MapPin size={14} color={Colors.text.secondary} strokeWidth={2} />
                <Text style={styles.locationText}>{locationLabel as string}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => router.push('/advanced-search' as any)}
          >
            <SlidersHorizontal size={22} color={Colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.resultsCount}>
          {isLoading ? 'Loading...' : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'property' : 'properties'} found`}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.propertiesList}>
          {filteredProperties.map((property) => {
            if (property.listingCategory === 'stand') {
              return (
                <StandCard
                  key={property.id}
                  stand={property as any}
                  onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: property.id, type: 'stand' } })}
                  variant="grid"
                />
              );
            } else if (property.listingCategory === 'commercial') {
              return (
                <CommercialPropertyCard
                  key={property.id}
                  property={property as any}
                  onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: property.id, type: 'commercial' } })}
                  variant="grid"
                />
              );
            } else if (property.listingCategory === 'room') {
              return (
                <RoomCard
                  key={property.id}
                  room={property as any}
                  onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: property.id, type: 'room' } })}
                  variant="grid"
                />
              );
            } else {
              return (
                <PropertyCard
                  key={property.id}
                  property={property as any}
                  onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: property.id } })}
                  variant="grid"
                />
              );
            }
          })}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  headerTop: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.gray[50],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerCenter: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  locationRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  filtersScroll: {
    paddingVertical: 8,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
    marginTop: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
  },
  propertiesList: {
    paddingHorizontal: 20,
    flexDirection: 'column' as const,
    gap: 16,
  },
});
