import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MapPin, Heart, Ruler, Car, Layers } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';
import { CommercialProperty } from '@/types/property';

interface CommercialPropertyCardProps {
  property: CommercialProperty;
  onPress: () => void;
  variant?: 'default' | 'featured' | 'grid' | 'carousel';
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function CommercialPropertyCard({ property, onPress, variant = 'default' }: CommercialPropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const isGrid = variant === 'grid';
  const isFeatured = variant === 'featured';
  const isCarousel = variant === 'carousel';
  const cardWidth = isGrid ? '100%' : isFeatured ? CARD_WIDTH : isCarousel ? '100%' : CARD_WIDTH * 0.85;

  const isNew = property.createdAt ? (Date.now() - new Date(property.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) : false;

  const getTypeBadgeColor = () => {
    switch (property.commercialType) {
      case 'office':
        return '#0EA5E9';
      case 'warehouse':
        return '#F97316';
      case 'shop':
        return '#EC4899';
      case 'retail':
        return '#A855F7';
      case 'industrial':
        return '#64748B';
      default:
        return '#0EA5E9';
    }
  };

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
        <Image source={{ uri: property.images[0] }} style={styles.image} />
        <View style={styles.badgeRow}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeBadgeColor() }]}>
            <Text style={styles.typeBadgeText}>{property.commercialType ? property.commercialType.charAt(0).toUpperCase() + property.commercialType.slice(1) : 'Commercial'}</Text>
          </View>
          {property.lister && (
            <View style={styles.listerBadgeContainer}>
              {property.lister.type === 'company' && property.lister.companyLogo ? (
                <Image source={{ uri: property.lister.companyLogo }} style={styles.listerBadge} />
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
              <Ruler size={16} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailValue}>{property.area.toLocaleString()}</Text>
              <Text style={styles.detailLabel}>m²</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Car size={16} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailValue}>{property.parkingSpaces}</Text>
              <Text style={styles.detailLabel}>Parking</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Layers size={16} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailValue}>{property.floors}</Text>
              <Text style={styles.detailLabel}>Floors</Text>
            </View>
          </View>
        </View>
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
    alignItems: 'center' as const,
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
  },
  typeBadge: {
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
});
