import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MapPin, Heart, Ruler, FileCheck, ShieldCheck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';
import { Stand } from '@/types/property';

interface StandCardProps {
  stand: Stand;
  onPress: () => void;
  variant?: 'default' | 'featured' | 'grid' | 'carousel';
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function StandCard({ stand, onPress, variant = 'default' }: StandCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const isGrid = variant === 'grid';
  const isFeatured = variant === 'featured';
  const isCarousel = variant === 'carousel';
  const cardWidth = isGrid ? '100%' : isFeatured ? CARD_WIDTH : isCarousel ? '100%' : CARD_WIDTH * 0.85;

  const isNew = stand.createdAt ? (Date.now() - new Date(stand.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000) : false;

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
        <Image source={{ uri: stand.images[0] }} style={styles.image} />
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>Stand</Text>
          </View>
          {stand.lister && (
            <View style={styles.listerBadgeContainer}>
              {stand.lister.type === 'company' && stand.lister.companyLogo ? (
                <Image source={{ uri: stand.lister.companyLogo }} style={styles.listerBadge} />
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
          {stand.title}
        </Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${stand.price.toLocaleString()}
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
            {stand.location.address}, {stand.location.city}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Ruler size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.detailValue}>{stand.area.toLocaleString()} m²</Text>
          </View>

          {stand.titleDeeds && (
            <View style={styles.detailItem}>
              <View style={styles.detailIconCircle}>
                <FileCheck size={18} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.detailLabel}>Title Deeds</Text>
            </View>
          )}

          {stand.serviced && (
            <View style={styles.detailItem}>
              <View style={styles.detailIconCircle}>
                <ShieldCheck size={18} color="#8B5CF6" strokeWidth={2.5} />
              </View>
              <Text style={styles.detailLabel}>Serviced</Text>
            </View>
          )}
        </View>

        {stand.developerSession && (
          <View style={styles.developerBadgeContainer}>
            <Text style={styles.developerBadge}>{stand.developerSession}</Text>
          </View>
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
    alignItems: 'center' as const,
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
    gap: 12,
    flexWrap: 'wrap' as const,
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
  detailValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0F172A',
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#0F172A',
  },
  developerBadgeContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  developerBadge: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#8B5CF6',
  },
});
