import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import OptimizedImage, { blurhash } from './OptimizedImage';
import { Bed, Bath, MapPin, Heart, User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';
import { Property } from '@/types/property';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
  variant?: 'default' | 'featured' | 'grid' | 'carousel';
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function PropertyCard({ property, onPress, variant = 'default' }: PropertyCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const isGrid = variant === 'grid';
  const isFeatured = variant === 'featured';
  const isCarousel = variant === 'carousel';
  const cardWidth = isGrid ? '100%' : isFeatured ? CARD_WIDTH : isCarousel ? '100%' : CARD_WIDTH * 0.85;

  const isNew = property.createdAt ? (Date.now() - new Date(property.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) : false;

  useEffect(() => {
    const fetchAgent = async () => {
      if (!property.agentId) return;

      try {
        const { data: agentData } = await supabase
          .from('agents')
          .select('user_id, company_name, company_logo')
          .eq('id', property.agentId)
          .single();

        if (agentData) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, avatar')
            .eq('id', agentData.user_id)
            .single();

          if (userData) {
            setAgentInfo({
              userId: userData.id,
              name: agentData.company_name || userData.name,
              avatar: agentData.company_logo || userData.avatar,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch agent info:', err);
      }
    };

    fetchAgent();
  }, [property.agentId]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isGrid ? styles.gridContainer : isCarousel ? styles.carouselContainer : { width: cardWidth },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.imageContainer, isGrid && styles.gridImageContainer, isCarousel && styles.carouselImageContainer]}>
        <OptimizedImage source={{ uri: property.images[0] }} style={styles.image} placeholder={blurhash} />
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{property.propertyType ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1) : 'Property'}</Text>
          </View>
          {property.lister && (
            <View style={styles.listerBadgeContainer}>
              {property.lister.type === 'company' && property.lister.companyLogo ? (
                <OptimizedImage source={{ uri: property.lister.companyLogo }} style={styles.listerBadge} />
              ) : (
                <View style={styles.privateBadge}>
                  <Text style={styles.privateBadgeText}>P</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e?.stopPropagation?.();
            setIsFavorite(!isFavorite);
          }}
        >
          <Heart
            size={20}
            color={isFavorite ? '#EF4444' : '#000000'}
            fill={isFavorite ? '#EF4444' : 'transparent'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${property.price.toLocaleString()}{property.priceType === 'monthly' ? '/month' : ''}
          </Text>
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={16} color="#64748B" strokeWidth={2} />
          <Text style={styles.location} numberOfLines={1}>
            {property.location.address}, {property.location.city}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Bed size={16} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailValue}>{property.bedrooms}</Text>
              <Text style={styles.detailLabel}>Beds</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Bath size={16} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailValue}>{property.bathrooms}</Text>
              <Text style={styles.detailLabel}>Baths</Text>
            </View>
          </View>
        </View>

        {agentInfo && (
          <TouchableOpacity
            style={styles.agentSection}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/profile/${agentInfo.userId}`);
            }}
            activeOpacity={0.7}
          >
            {agentInfo.avatar ? (
              <OptimizedImage
                source={{ uri: agentInfo.avatar }}
                style={styles.agentAvatar}
              />
            ) : (
              <View style={styles.agentAvatarPlaceholder}>
                <User size={16} color={Colors.white} />
              </View>
            )}
            <View style={styles.agentInfo}>
              <Text style={styles.agentLabel}>Listed by</Text>
              <Text style={styles.agentName} numberOfLines={1}>{agentInfo.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: DesignSystem.propertyCard.borderRadius,
    marginHorizontal: 0,
    width: '100%' as const,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridContainer: {
    width: '100%' as const,
    marginHorizontal: 0,
  },
  carouselContainer: {
    width: '100%' as const,
    marginHorizontal: 0,
  },
  imageContainer: {
    width: '100%' as const,
    height: 220,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderTopLeftRadius: DesignSystem.propertyCard.borderRadius,
    borderTopRightRadius: DesignSystem.propertyCard.borderRadius,
  },
  gridImageContainer: {
    height: 220,
  },
  carouselImageContainer: {
    height: 220,
  },
  badgeRow: {
    position: 'absolute' as const,
    top: 12,
    left: 12,
    flexDirection: 'row' as const,
    gap: 8,
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
  },
  typeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  listerBadgeContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden' as const,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  listerBadge: {
    width: '100%' as const,
    height: '100%' as const,
  },
  privateBadge: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: '#8B5CF6',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  privateBadgeText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    padding: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  locationContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500' as const,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  detailIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}1A`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  detailLabelContainer: {
    flexDirection: 'column' as const,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0F172A',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#64748B',
  },
  agentSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
  },
  agentAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  agentInfo: {
    flex: 1,
    gap: 2,
  },
  agentLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500' as const,
  },
  agentName: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600' as const,
  },
});
