import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Edit, Eye, MoreVertical } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';
import { ManagedProperty } from '@/types/property';

interface ManagedPropertyCardProps {
  property: ManagedProperty;
  onPress: () => void;
  onEdit: () => void;
  onStatusChange: () => void;
}

export default function ManagedPropertyCard({ 
  property, 
  onPress,
  onEdit,
  onStatusChange 
}: ManagedPropertyCardProps) {
  const getStatusColor = () => {
    switch (property.status) {
      case 'Vacant': return '#10B981';
      case 'Occupied': return Colors.primary;
      case 'Under Maintenance': return '#F59E0B';
      case 'For Sale': return Colors.accent;
      default: return Colors.gray[400];
    }
  };

  const getTypeColor = () => {
    return property.type === 'Residential' ? '#8B5CF6' : '#06B6D4';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {property.images.length > 0 ? (
          <Image 
            source={{ uri: property.images[0] }} 
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.badgeText}>{property.status}</Text>
          </View>
          {property.isListed && (
            <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.badgeText}>Listed</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {property.name}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              {property.address}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={onStatusChange}
          >
            <MoreVertical size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.details}>
          <View style={[styles.typeTag, { backgroundColor: `${getTypeColor()}15` }]}>
            <Text style={[styles.typeText, { color: getTypeColor() }]}>
              {property.type}
            </Text>
          </View>
          
          {property.tenant && (
            <View style={styles.tenantInfo}>
              <Text style={styles.tenantLabel}>Tenant:</Text>
              <Text style={styles.tenantName} numberOfLines={1}>
                {property.tenant.name}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.metaInfo}>
            <Eye size={14} color={Colors.text.light} />
            <Text style={styles.metaText}>
              Updated {formatDate(property.updatedAt)}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEdit}
          >
            <Edit size={16} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {property.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notes} numberOfLines={2}>
              {property.notes}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: DesignSystem.card.borderRadius,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: DesignSystem.spacing.md,
  },
  imageContainer: {
    width: '100%' as const,
    height: 180,
    position: 'relative' as const,
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
  },
  placeholderImage: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.text.light,
    fontWeight: '600' as const,
  },
  badges: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    flexDirection: 'row' as const,
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  content: {
    padding: DesignSystem.card.padding,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
    backgroundColor: Colors.gray[50],
  },
  details: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap' as const,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  tenantInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    flex: 1,
  },
  tenantLabel: {
    fontSize: 13,
    color: Colors.text.light,
    fontWeight: '600' as const,
  },
  tenantName: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: '600' as const,
    flex: 1,
  },
  footer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  metaInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.light,
  },
  editButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  notes: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
