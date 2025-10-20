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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  MapPin,
  Calendar,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import Colors from '@/constants/colors';

export default function PropertyManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');
  const { data: propertiesData, isLoading } = trpc.properties.list.useQuery({
    limit: 1000,
    offset: 0,
  });
  const deletePropertyMutation = trpc.properties.delete.useMutation();
  const utils = trpc.useUtils();

  const properties = propertiesData?.properties || [];

  const filteredProperties = useMemo(() => {
    return properties.filter((property: any) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !property.title.toLowerCase().includes(query) &&
          !property.location?.city?.toLowerCase().includes(query) &&
          !property.location?.address?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [properties, searchQuery]);

  const handleDelete = (propertyId: string, propertyTitle: string) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${propertyTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePropertyMutation.mutateAsync({ id: propertyId });
              await utils.properties.list.invalidate();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete property');
              console.error('Failed to delete property:', error);
            }
          },
        },
      ]
    );
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
              {filteredProperties.length} of {properties.length} properties
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
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading properties...</Text>
          </View>
        ) : filteredProperties.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No properties found</Text>
          </View>
        ) : (
        <View style={styles.section}>
          {filteredProperties.map((property: any) => (
            <View key={property.id} style={styles.propertyCard}>
              {property.images && property.images.length > 0 && (
                <Image source={{ uri: property.images[0] }} style={styles.propertyImage} />
              )}
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle} numberOfLines={2}>
                  {property.title}
                </Text>
                
                <View style={styles.propertyMeta}>
                  <View style={styles.metaRow}>
                    <MapPin size={14} color={Colors.text.secondary} />
                    <Text style={styles.metaText}>
                      {property.location?.city || 'N/A'}, {property.location?.country || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Calendar size={14} color={Colors.text.secondary} />
                    <Text style={styles.metaText}>Added {new Date(property.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>

                <View style={styles.propertyStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Price</Text>
                    <Text style={styles.statValue}>
                      ${(property.price || 0).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Views</Text>
                    <Text style={styles.statValue}>{(property.views || 0).toLocaleString()}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Bookings</Text>
                    <Text style={styles.statValue}>{property._count?.bookings || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Type</Text>
                    <Text style={[styles.statValue, styles.statusText]}>{property.listingType || 'N/A'}</Text>
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
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.actionBtnDanger]}
                    onPress={() => handleDelete(property.id, property.title)}
                  >
                    <Trash2 size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
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
    outlineStyle: 'none' as const,
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
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
});
