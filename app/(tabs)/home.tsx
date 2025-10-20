import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Bell, Plus, Star, Clock, Grid3x3 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { mockListings } from '@/mocks/properties';
import { useSupabaseProperties } from '@/hooks/useSupabaseProperties';
import BannerCarousel from '@/components/BannerCarousel';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import PropertyCard from '@/components/PropertyCard';
import StandCard from '@/components/StandCard';
import CommercialPropertyCard from '@/components/CommercialPropertyCard';
import RoomCard from '@/components/RoomCard';
import SectionHeader from '@/components/SectionHeader';
import { Listing } from '@/types/property';
import { getAllCityNames } from '@/constants/locations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { banners } = useSuperAdmin();
  const insets = useSafeAreaInsets();
  const [location] = useState('Harare');
  const [showTotalPrice, setShowTotalPrice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allCities = useMemo(() => getAllCityNames(), []);

  const { properties, isLoading: isLoadingProperties } = useSupabaseProperties({
    limit: 20,
    featured: false,
  });

  const { properties: featuredProperties, isLoading: isLoadingFeatured } = useSupabaseProperties({
    limit: 10,
    featured: true,
  });

  const allProperties = properties.length > 0 ? properties : mockListings;
  const displayFeatured = featuredProperties.length > 0 ? featuredProperties : mockListings.filter((l: Listing) => l.featured);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return allCities.filter(city => city.toLowerCase().includes(query)).slice(0, 5);
  }, [searchQuery, allCities]);

  const handleSelectSuggestion = (city: string) => {
    setSearchQuery(city);
    setShowSuggestions(false);
    router.push({ pathname: '/search-results' as any, params: { query: city, city } });
  };



  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 20 }]}>
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/agent/add-property' as any)}
              >
                <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <View style={styles.rightSection}>
              <TouchableOpacity 
                style={styles.notifButton}
                onPress={() => router.push('/(tabs)/notifications' as any)}
              >
                <Bell size={20} color="#0F172A" strokeWidth={2} />
                <View style={styles.notifBadge} />
              </TouchableOpacity>
              <Image 
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ifbay395j090acyodisqd' }} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.priceToggleSection}>
            <View style={styles.priceToggleContent}>
              <View>
                <Text style={styles.priceToggleLabel}>Show total price</Text>
                <Text style={styles.priceToggleSubtext}>Including surcharges and taxes</Text>
              </View>
              <Switch
                value={showTotalPrice}
                onValueChange={setShowTotalPrice}
                trackColor={{ false: '#E2E8F0', true: Colors.primary }}
                thumbColor={Colors.white}
                style={Platform.OS === 'web' ? { transform: [{ scale: 0.8 }] } : {}}
              />
            </View>
          </View>

          <View style={styles.searchSection}>
            <View style={styles.searchInputWrapper}>
              <MapPin size={18} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search properties, location, etc..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setShowSuggestions(text.length >= 2);
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                returnKeyType="search"
                onSubmitEditing={() => {
                  if (searchQuery.trim()) {
                    setShowSuggestions(false);
                    router.push({ pathname: '/search-results' as any, params: { query: searchQuery, city: location } });
                  }
                }}
              />
            </View>

            {showSuggestions && filteredSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {filteredSuggestions.map((city, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(city)}
                  >
                    <MapPin size={16} color="#64748B" strokeWidth={2} />
                    <Text style={styles.suggestionText}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity 
              style={styles.advancedSearchButton}
              onPress={() => router.push('/advanced-search' as any)}
            >
              <Search size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.advancedSearchText}>Advanced Search</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.findButton}
              onPress={() => {
                router.push({ pathname: '/search-results' as any, params: { query: searchQuery, city: location } });
              }}
            >
              <Text style={styles.findButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.recommendedSection}>
            <SectionHeader
              icon={Star}
              title="Featured Listings"
              subtitle="Hand-picked premium properties"
              onActionPress={() => router.push('/search-results' as any)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              snapToInterval={SCREEN_WIDTH * 0.85 + 16}
              decelerationRate="fast"
              snapToAlignment="start"
            >
              {displayFeatured.map((listing: any) => (
                <View key={listing.id} style={styles.carouselCardWrapper}>
                  {listing.listingCategory === 'stand' ? (
                    <StandCard
                      stand={listing as any}
                      onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id, type: 'stand' } })}
                      variant="carousel"
                    />
                  ) : listing.listingCategory === 'commercial' ? (
                    <CommercialPropertyCard
                      property={listing as any}
                      onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id, type: 'commercial' } })}
                      variant="carousel"
                    />
                  ) : listing.listingCategory === 'room' ? (
                    <RoomCard
                      room={listing as any}
                      onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id, type: 'room' } })}
                      variant="carousel"
                    />
                  ) : (
                    <PropertyCard
                      property={listing as any}
                      onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id } })}
                      variant="carousel"
                    />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>

          {banners.filter(b => b.enabled).length > 0 && (
            <View style={styles.bannerSection}>
              <BannerCarousel />
            </View>
          )}

          <View style={styles.listSection}>
            <SectionHeader
              icon={Clock}
              title="Just Listed"
              subtitle="Fresh properties just added"
              onActionPress={() => router.push('/search-results' as any)}
            />
            <View style={styles.listGrid}>
              {allProperties.slice(0, 4).map((listing: any) => (
                listing.listingCategory === 'stand' ? (
                  <StandCard
                    key={listing.id}
                    stand={listing as any}
                    onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id, type: 'stand' } })}
                    variant="grid"
                  />
                ) : listing.listingCategory === 'commercial' ? (
                  <CommercialPropertyCard
                    key={listing.id}
                    property={listing as any}
                    onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id, type: 'commercial' } })}
                    variant="grid"
                  />
                ) : listing.listingCategory === 'room' ? (
                  <RoomCard
                    key={listing.id}
                    room={listing as any}
                    onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id, type: 'room' } })}
                    variant="grid"
                  />
                ) : (
                  <PropertyCard
                    key={listing.id}
                    property={listing as any}
                    onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id } })}
                    variant="grid"
                  />
                )
              ))}
            </View>
          </View>

          {banners.filter(b => b.enabled).length > 0 && (
            <View style={styles.bannerSection}>
              <BannerCarousel />
            </View>
          )}

          <View style={styles.listSection}>
            <SectionHeader
              icon={Grid3x3}
              title="Browse"
              subtitle="Explore more listings"
              onActionPress={() => router.push('/search-results' as any)}
            />
            <View style={styles.listGrid}>
              {allProperties.slice(2, 6).map((listing: any) => (
                listing.listingCategory === 'stand' ? (
                  <StandCard
                    key={listing.id}
                    stand={listing as any}
                    onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id, type: 'stand' } })}
                    variant="grid"
                  />
                ) : listing.listingCategory === 'commercial' ? (
                  <CommercialPropertyCard
                    key={listing.id}
                    property={listing as any}
                    onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id, type: 'commercial' } })}
                    variant="grid"
                  />
                ) : listing.listingCategory === 'room' ? (
                  <RoomCard
                    key={listing.id}
                    room={listing as any}
                    onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id, type: 'room' } })}
                    variant="grid"
                  />
                ) : (
                  <PropertyCard
                    key={listing.id}
                    property={listing as any}
                    onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: listing.id } })}
                    variant="grid"
                  />
                )
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rightSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
  },
  notifBadge: {
    position: 'absolute' as const,
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#F8FAFC',
  },
  priceToggleSection: {
    marginBottom: 20,
  },
  priceToggleContent: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  priceToggleLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  priceToggleSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  advancedSearchButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  advancedSearchText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  searchInputWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
    outlineStyle: 'none' as const,
  },
  findButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  findButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500' as const,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
  },

  recommendedSection: {
    marginBottom: 28,
  },

  carouselContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  carouselCardWrapper: {
    width: SCREEN_WIDTH * 0.85,
  },
  bannerSection: {
    marginBottom: 28,
  },
  listSection: {
    marginBottom: 28,
  },
  listGrid: {
    paddingHorizontal: 24,
    flexDirection: 'column' as const,
    gap: 16,
  },
});
