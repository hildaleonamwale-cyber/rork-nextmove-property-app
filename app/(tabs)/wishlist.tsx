import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Home as HomeIcon, Bath, Heart, Building2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';
import UniformHeader from '@/components/UniformHeader';
import { useSupabaseWishlist } from '@/hooks/useSupabaseWishlist';
import { useUser } from '@/contexts/UserContext';
import LoginPrompt from '@/components/LoginPrompt';

type TabType = 'wishlist' | 'following';

export default function WishlistScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('wishlist');
  const { user, isLoading: userLoading } = useUser();
  const { wishlist, removeFromWishlist, isLoading, error } = useSupabaseWishlist(user?.id || '');

  const favoriteProperties = wishlist;

  const removeFavorite = async (id: string) => {
    try {
      await removeFromWishlist(id);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  if (!user && !userLoading) {
    return (
      <View style={styles.container}>
        <UniformHeader title="Wishlist" />
        <LoginPrompt 
          message="Please log in to view your saved properties and followed agencies"
          icon={Heart}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UniformHeader 
        title="Wishlist"
      />

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'wishlist' && styles.tabActive]}
          onPress={() => setActiveTab('wishlist')}
        >
          <Heart size={20} color={activeTab === 'wishlist' ? Colors.primary : Colors.text.secondary} strokeWidth={2.5} />
          <Text style={[styles.tabText, activeTab === 'wishlist' && styles.tabTextActive]}>Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.tabActive]}
          onPress={() => setActiveTab('following')}
        >
          <Building2 size={20} color={activeTab === 'following' ? Colors.primary : Colors.text.secondary} strokeWidth={2.5} />
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>Following</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'wishlist' ? (
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading wishlist...</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          ) : favoriteProperties.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Heart size={64} color="#E2E8F0" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No Saved Properties</Text>
              <Text style={styles.emptyDescription}>
                Properties you save will appear here. Start exploring and save your favorites!
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/home' as any)}
              >
                <Text style={styles.exploreButtonText}>Explore Properties</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.propertiesContainer}>
              <View style={styles.propertiesList}>
                {favoriteProperties.map((property) => (
                  <TouchableOpacity
                    key={property.id}
                    style={styles.propertyCard}
                    onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: property.id } })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.propertyImageContainer}>
                      <Image 
                        source={{ uri: property.images[0] }} 
                        style={styles.propertyImage}
                      />
                      <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          removeFavorite(property.id);
                        }}
                      >
                        <Heart
                          size={18}
                          color="#EF4444"
                          fill="#EF4444"
                          strokeWidth={2}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.propertyInfo}>
                      <Text style={styles.propertyTitle} numberOfLines={1}>
                        {property.title}
                      </Text>
                      
                      <View style={styles.locationRow}>
                        <MapPin size={14} color="#64748B" strokeWidth={2} />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {property.location.city}
                        </Text>
                      </View>

                      {property.listingCategory !== 'stand' && property.listingCategory !== 'commercial' && 'bedrooms' in property && (
                        <View style={styles.detailsRow}>
                          <View style={styles.detailItem}>
                            <HomeIcon size={14} color={Colors.primary} strokeWidth={2} />
                            <Text style={styles.detailText}>{property.bedrooms} Bedroom</Text>
                          </View>
                          {'bathrooms' in property && (
                            <View style={styles.detailItem}>
                              <Bath size={14} color={Colors.primary} strokeWidth={2} />
                              <Text style={styles.detailText}>{property.bathrooms} Bathroom</Text>
                            </View>
                          )}
                        </View>
                      )}

                      <Text style={styles.propertyPrice}>
                        ${property.price.toLocaleString()}
                        <Text style={styles.priceType}>
                          {property.priceType === 'monthly' ? '/month' : ''}
                        </Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )
        ) : (
          <View style={styles.followingContainer}>
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Building2 size={64} color="#E2E8F0" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>Following Coming Soon</Text>
              <Text style={styles.emptyDescription}>
                Follow agencies and agents to see their latest property updates here.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row' as const,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: DesignSystem.contentPadding,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  tabActive: {
    backgroundColor: `${Colors.primary}15`,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700' as const,
  },

  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingTop: 100,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8FAFC',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center' as const,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  propertiesContainer: {
    padding: DesignSystem.contentPadding,
  },
  propertiesList: {
    gap: 14,
  },
  propertyCard: {
    flexDirection: 'row' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  propertyImageContainer: {
    width: 100,
    height: 120,
    position: 'relative' as const,
  },
  propertyImage: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: '#F8FAFC',
  },
  favoriteButton: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between' as const,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500' as const,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600' as const,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  priceType: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#64748B',
  },
  followingContainer: {
    flex: 1,
  },
});
