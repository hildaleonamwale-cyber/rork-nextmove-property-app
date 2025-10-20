import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Home as HomeIcon, Bath, Heart, Calendar, Building2, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';
import UniformHeader from '@/components/UniformHeader';
import SectionHeader from '@/components/SectionHeader';
import { mockProperties, mockAgencies } from '@/mocks/properties';

type TabType = 'wishlist' | 'following';

export default function WishlistScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('wishlist');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(mockProperties.slice(0, 5).map(p => p.id)));
  const [followedAgencies, setFollowedAgencies] = useState<Set<string>>(new Set([mockAgencies[0]?.id].filter(Boolean)));

  const favoriteProperties = mockProperties.filter(p => favorites.has(p.id));
  
  const followedAgenciesList = mockAgencies.filter(a => followedAgencies.has(a.id));

  const removeFavorite = (id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

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
        {activeTab === 'wishlist' && favoriteProperties.length === 0 ? (
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
        ) : activeTab === 'wishlist' ? (
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

                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <HomeIcon size={14} color={Colors.primary} strokeWidth={2} />
                        <Text style={styles.detailText}>{property.bedrooms} Bedroom</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Bath size={14} color={Colors.primary} strokeWidth={2} />
                        <Text style={styles.detailText}>{property.bathrooms} Bathroom</Text>
                      </View>
                    </View>

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
        ) : (
          <View style={styles.followingContainer}>
            {followedAgenciesList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Building2 size={64} color="#E2E8F0" strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>Not Following Anyone</Text>
                <Text style={styles.emptyDescription}>
                  Follow agencies and agents to see their latest property updates here.
                </Text>
              </View>
            ) : (
              <View style={styles.followingList}>
                {followedAgenciesList.map(agency => {
                  const agencyProperties = mockProperties.filter(p => 
                    agency.staff.some(s => s.id === p.agentId)
                  ).slice(0, 3);
                  
                  return (
                    <View key={agency.id} style={styles.agencySection}>
                      <TouchableOpacity 
                        style={styles.agencyHeader}
                        onPress={() => router.push({ pathname: '/profile/[id]' as any, params: { id: agency.id, type: 'agency' } })}
                      >
                        <Image source={{ uri: agency.logo }} style={styles.agencyLogo} />
                        <View style={styles.agencyInfo}>
                          <View style={styles.agencyNameRow}>
                            <Building2 size={18} color={Colors.primary} strokeWidth={2.5} />
                            <Text style={styles.agencyName}>{agency.name}</Text>
                          </View>
                          <View style={styles.agencyMetaRow}>
                            <Calendar size={14} color={Colors.text.secondary} />
                            <Text style={styles.agencyMetaText}>Updated 2 days ago</Text>
                          </View>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.agencyPropertiesList}>
                        {agencyProperties.map(property => (
                          <TouchableOpacity
                            key={property.id}
                            style={styles.followPropertyCard}
                            onPress={() => router.push({ pathname: '/property/[id]' as any, params: { id: property.id } })}
                            activeOpacity={0.7}
                          >
                            <View style={styles.followPropertyImageContainer}>
                              <Image 
                                source={{ uri: property.images[0] }} 
                                style={styles.followPropertyImage}
                              />
                            </View>

                            <View style={styles.followPropertyInfo}>
                              <Text style={styles.followPropertyTitle} numberOfLines={1}>
                                {property.title}
                              </Text>
                              
                              <View style={styles.locationRow}>
                                <MapPin size={14} color="#64748B" strokeWidth={2} />
                                <Text style={styles.locationText} numberOfLines={1}>
                                  {property.location.city}
                                </Text>
                              </View>

                              <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                  <HomeIcon size={14} color={Colors.primary} strokeWidth={2} />
                                  <Text style={styles.detailText}>{property.bedrooms} Bedroom</Text>
                                </View>
                                <View style={styles.detailItem}>
                                  <Bath size={14} color={Colors.primary} strokeWidth={2} />
                                  <Text style={styles.detailText}>{property.bathrooms} Bathroom</Text>
                                </View>
                              </View>

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
                  );
                })}
              </View>
            )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginBottom: 16,
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
  followingList: {
    padding: DesignSystem.contentPadding,
    gap: 24,
  },
  agencySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  agencyHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  agencyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
  },
  agencyInfo: {
    flex: 1,
    gap: 4,
  },
  agencyNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  agencyName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#0F172A',
  },
  agencyMetaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  agencyMetaText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  agencyPropertiesList: {
    gap: 12,
  },
  followPropertyCard: {
    flexDirection: 'row' as const,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  followPropertyImageContainer: {
    width: 90,
    height: 100,
  },
  followPropertyImage: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: '#E2E8F0',
  },
  followPropertyInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between' as const,
  },
  followPropertyTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginBottom: 2,
  },
});
