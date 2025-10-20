import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, MapPin, DollarSign, Home as HomeIcon, Bed, Bath, Car, Waves, Ruler, ChevronDown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListingCategory } from '@/types/property';
import { PROVINCES, getCitiesByProvince, Province } from '@/constants/locations';

export default function AdvancedSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [listingCategory, setListingCategory] = useState<ListingCategory>('property');
  const [transactionType, setTransactionType] = useState<'rent' | 'buy'>('rent');
  const [propertyType, setPropertyType] = useState<string>('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [province, setProvince] = useState<Province>('Harare');
  const [city, setCity] = useState('Harare');
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const propertyTypes = [
    'Full House',
    'Cottage',
    'Rooms',
    'Stand-alone',
    'Flat',
    'Shared',
    'Cluster House',
  ];

  const bedroomOptions = [1, 2, 3, 4, 5];
  const bathroomOptions = [1, 2, 3, 4];
  const facilityOptions = ['Pool', 'Garage', 'Bath'];

  const toggleFacility = (facility: string) => {
    setFacilities(prev =>
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const handleSearch = () => {
    console.log('Searching with filters:', {
      listingCategory,
      transactionType,
      propertyType,
      priceMin,
      priceMax,
      bedrooms,
      bathrooms,
      facilities,
      province,
      city,
    });
    router.push({
      pathname: '/search-results',
      params: {
        listingCategory,
        transactionType,
        propertyType,
        priceMin,
        priceMax,
        bedrooms: bedrooms?.toString() || '',
        bathrooms: bathrooms?.toString() || '',
        facilities: facilities.join(','),
        province,
        city,
      },
    });
  };

  const handleReset = () => {
    setListingCategory('property');
    setTransactionType('rent');
    setPropertyType('');
    setPriceMin('');
    setPriceMax('');
    setBedrooms(null);
    setBathrooms(null);
    setFacilities([]);
    setProvince('Harare');
    setCity('Harare');
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Advanced Search</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color="#0F172A" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Type</Text>
          <View style={styles.listingTypeGrid}>
            <TouchableOpacity
              style={[
                styles.listingTypeButton,
                listingCategory === 'property' && styles.listingTypeButtonActive,
              ]}
              onPress={() => setListingCategory('property')}
            >
              <HomeIcon
                size={18}
                color={listingCategory === 'property' ? '#FFFFFF' : '#64748B'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.listingTypeButtonText,
                  listingCategory === 'property' && styles.listingTypeButtonTextActive,
                ]}
              >
                Properties
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.listingTypeButton,
                listingCategory === 'stand' && styles.listingTypeButtonActive,
              ]}
              onPress={() => setListingCategory('stand')}
            >
              <Ruler
                size={18}
                color={listingCategory === 'stand' ? '#FFFFFF' : '#64748B'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.listingTypeButtonText,
                  listingCategory === 'stand' && styles.listingTypeButtonTextActive,
                ]}
              >
                Stands
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.listingTypeButton,
                listingCategory === 'room' && styles.listingTypeButtonActive,
              ]}
              onPress={() => setListingCategory('room')}
            >
              <Bed
                size={18}
                color={listingCategory === 'room' ? '#FFFFFF' : '#64748B'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.listingTypeButtonText,
                  listingCategory === 'room' && styles.listingTypeButtonTextActive,
                ]}
              >
                Rooms
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.listingTypeButton,
                listingCategory === 'commercial' && styles.listingTypeButtonActive,
              ]}
              onPress={() => setListingCategory('commercial')}
            >
              <HomeIcon
                size={18}
                color={listingCategory === 'commercial' ? '#FFFFFF' : '#64748B'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.listingTypeButtonText,
                  listingCategory === 'commercial' && styles.listingTypeButtonTextActive,
                ]}
              >
                Commercial
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Type</Text>
          <View style={styles.transactionRow}>
            <TouchableOpacity
              style={[
                styles.transactionButton,
                transactionType === 'rent' && styles.transactionButtonActive,
              ]}
              onPress={() => setTransactionType('rent')}
            >
              <Text
                style={[
                  styles.transactionButtonText,
                  transactionType === 'rent' && styles.transactionButtonTextActive,
                ]}
              >
                Rent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.transactionButton,
                transactionType === 'buy' && styles.transactionButtonActive,
              ]}
              onPress={() => setTransactionType('buy')}
            >
              <Text
                style={[
                  styles.transactionButtonText,
                  transactionType === 'buy' && styles.transactionButtonTextActive,
                ]}
              >
                Buy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowProvincePicker(!showProvincePicker)}
          >
            <MapPin size={18} color="#64748B" strokeWidth={2} />
            <Text style={styles.pickerButtonText}>{province}</Text>
            <ChevronDown size={18} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>

          {showProvincePicker && (
            <View style={styles.pickerContainer}>
              <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                {PROVINCES.map((prov) => (
                  <TouchableOpacity
                    key={prov}
                    style={styles.pickerItem}
                    onPress={() => {
                      setProvince(prov as Province);
                      setCity(getCitiesByProvince(prov as Province)[0] || '');
                      setShowProvincePicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{prov}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCityPicker(!showCityPicker)}
          >
            <MapPin size={18} color="#64748B" strokeWidth={2} />
            <Text style={styles.pickerButtonText}>{city || 'Select City'}</Text>
            <ChevronDown size={18} color="#64748B" strokeWidth={2} />
          </TouchableOpacity>

          {showCityPicker && (
            <View style={styles.pickerContainer}>
              <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                {getCitiesByProvince(province).map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.pickerItem}
                    onPress={() => {
                      setCity(c);
                      setShowCityPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {listingCategory === 'property' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Type</Text>
            <View style={styles.chipsContainer}>
              {propertyTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    propertyType === type && styles.chipActive,
                  ]}
                  onPress={() => setPropertyType(propertyType === type ? '' : type)}
                >
                  <HomeIcon
                    size={14}
                    color={propertyType === type ? '#FFFFFF' : '#64748B'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      propertyType === type && styles.chipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <DollarSign size={18} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Min"
                placeholderTextColor="#94A3B8"
                value={priceMin}
                onChangeText={setPriceMin}
                keyboardType="numeric"
              />
            </View>
            <Text style={styles.separator}>-</Text>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <DollarSign size={18} color="#64748B" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Max"
                placeholderTextColor="#94A3B8"
                value={priceMax}
                onChangeText={setPriceMax}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {listingCategory === 'property' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bedrooms</Text>
            <View style={styles.numberButtonsRow}>
              {bedroomOptions.map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.numberButton,
                    bedrooms === num && styles.numberButtonActive,
                  ]}
                  onPress={() => setBedrooms(bedrooms === num ? null : num)}
                >
                  <Bed
                    size={16}
                    color={bedrooms === num ? '#FFFFFF' : '#64748B'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.numberButtonText,
                      bedrooms === num && styles.numberButtonTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.numberButton,
                  (bedrooms && bedrooms > 5) && styles.numberButtonActive,
                ]}
                onPress={() => setBedrooms(bedrooms && bedrooms > 5 ? null : 6)}
              >
                <Text
                  style={[
                    styles.numberButtonText,
                    (bedrooms && bedrooms > 5) && styles.numberButtonTextActive,
                  ]}
                >
                  5+
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {listingCategory === 'property' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bathrooms</Text>
            <View style={styles.numberButtonsRow}>
              {bathroomOptions.map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.numberButton,
                    bathrooms === num && styles.numberButtonActive,
                  ]}
                  onPress={() => setBathrooms(bathrooms === num ? null : num)}
                >
                  <Bath
                    size={16}
                    color={bathrooms === num ? '#FFFFFF' : '#64748B'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.numberButtonText,
                      bathrooms === num && styles.numberButtonTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.numberButton,
                  (bathrooms && bathrooms > 4) && styles.numberButtonActive,
                ]}
                onPress={() => setBathrooms(bathrooms && bathrooms > 4 ? null : 5)}
              >
                <Text
                  style={[
                    styles.numberButtonText,
                    (bathrooms && bathrooms > 4) && styles.numberButtonTextActive,
                  ]}
                >
                  4+
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.facilityButton,
                facilities.includes('Pool') && styles.facilityButtonActive,
              ]}
              onPress={() => toggleFacility('Pool')}
            >
              <Waves
                size={18}
                color={facilities.includes('Pool') ? '#FFFFFF' : '#64748B'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.facilityButtonText,
                  facilities.includes('Pool') && styles.facilityButtonTextActive,
                ]}
              >
                Pool
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.facilityButton,
                facilities.includes('Garage') && styles.facilityButtonActive,
              ]}
              onPress={() => toggleFacility('Garage')}
            >
              <Car
                size={18}
                color={facilities.includes('Garage') ? '#FFFFFF' : '#64748B'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.facilityButtonText,
                  facilities.includes('Garage') && styles.facilityButtonTextActive,
                ]}
              >
                Garage
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.facilityButton,
                facilities.includes('Bath') && styles.facilityButtonActive,
              ]}
              onPress={() => toggleFacility('Bath')}
            >
              <Bath
                size={18}
                color={facilities.includes('Bath') ? '#FFFFFF' : '#64748B'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.facilityButtonText,
                  facilities.includes('Bath') && styles.facilityButtonTextActive,
                ]}
              >
                Bath
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === 'web' ? 20 : insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#0F172A',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginBottom: 16,
  },
  listingTypeGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  listingTypeButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: '48%' as const,
    flex: 1,
  },
  listingTypeButtonActive: {
    backgroundColor: '#4FD2C5',
    borderColor: '#4FD2C5',
  },
  listingTypeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  listingTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  transactionRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  transactionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center' as const,
  },
  transactionButtonActive: {
    backgroundColor: '#4FD2C5',
    borderColor: '#4FD2C5',
  },
  transactionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  transactionButtonTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
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
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500' as const,
  },
  chipsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#4FD2C5',
    borderColor: '#4FD2C5',
  },
  chipText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600' as const,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  cityButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    justifyContent: 'center' as const,
  },
  cityButtonActive: {
    backgroundColor: '#4FD2C5',
    borderColor: '#4FD2C5',
  },
  cityButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  cityButtonTextActive: {
    color: '#FFFFFF',
  },
  numberButtonsRow: {
    flexDirection: 'row' as const,
    gap: 10,
    flexWrap: 'wrap' as const,
  },
  numberButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  numberButtonActive: {
    backgroundColor: '#4FD2C5',
    borderColor: '#4FD2C5',
  },
  numberButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  numberButtonTextActive: {
    color: '#FFFFFF',
  },
  facilityButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    justifyContent: 'center' as const,
  },
  facilityButtonActive: {
    backgroundColor: '#4FD2C5',
    borderColor: '#4FD2C5',
  },
  facilityButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#64748B',
  },
  facilityButtonTextActive: {
    color: '#FFFFFF',
  },
  separator: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600' as const,
  },
  footer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center' as const,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#64748B',
  },
  searchButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4FD2C5',
    alignItems: 'center' as const,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  pickerButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    gap: 10,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500' as const,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    maxHeight: 200,
    overflow: 'hidden' as const,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500' as const,
  },
});
