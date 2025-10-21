import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Home, DollarSign, MapPin, Bed, Bath, Ruler, ImageIcon, Plus, Car, Waves, Tag, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAgent } from '@/contexts/AgentContext';
import { supabase } from '@/lib/supabase';
import SuccessPrompt from '@/components/SuccessPrompt';
import { PropertyDraft } from '@/types/property';
import { PROVINCES, getCitiesByProvince, Province } from '@/constants/locations';

export default function AddPropertyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAgent();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'monthly' as 'monthly' | 'sale',
    address: '',
    area: '',
    city: 'Harare',
    province: 'Harare' as Province,
    country: 'Zimbabwe',
    bedrooms: '',
    bathrooms: '',
    propertyArea: '',
    propertyType: 'Full House',
    status: 'For Rent' as 'For Rent' | 'For Sale' | 'Internal Management',
  });
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const propertyTypes = [
    'Full House',
    'Cottage',
    'Rooms',
    'Stand-alone',
    'Flat',
    'Shared',
    'Cluster House',
  ];

  const facilities = ['Pool', 'Garage', 'Bath', 'Garden', 'Gym', 'Security'];
  const tags = ['Pet Friendly', 'Furnished', 'Newly Built', 'Renovated', 'Parking Available', 'Near School', 'Near Mall'];

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev =>
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!profile?.id || !profile?.userId) {
      Alert.alert('Error', 'Please complete agent onboarding first');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Creating property for agent:', profile.id);

      const propertyData = {
        agent_id: profile.id,
        user_id: profile.userId,
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyType,
        listing_category: 'property',
        status: formData.status,
        price: parseFloat(formData.price) || 0,
        price_type: formData.priceType === 'sale' ? 'total' : 'monthly',
        images: JSON.stringify(selectedImages),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.propertyArea) || 0,
        area_unit: 'sqm',
        furnished: selectedFacilities.includes('Furnished'),
        parking: selectedFacilities.includes('Garage') || selectedFacilities.includes('Parking Available'),
        amenities: JSON.stringify([...selectedFacilities, ...selectedTags]),
        address: formData.address,
        city: formData.city,
        state: formData.province,
        country: formData.country,
        featured: false,
        views: 0,
        inquiries: 0,
      };

      console.log('Property data:', propertyData);

      const { data, error } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (error) {
        console.error('Property creation error:', error);
        throw new Error(error.message);
      }

      console.log('Property created successfully:', data);
      setShowSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Failed to create property:', error);
      Alert.alert('Error', error.message || 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSave = formData.title.trim() && formData.price && formData.city && formData.province;

  const availableCities = getCitiesByProvince(formData.province);

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Property</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ImageIcon size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Property Images</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
              <Plus size={28} color={Colors.text.secondary} />
              <Text style={styles.addImageText}>Add Photos</Text>
            </TouchableOpacity>

            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.propertyImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Home size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Property Title"
            placeholderTextColor={Colors.text.light}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (Optional)"
            placeholderTextColor={Colors.text.light}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.chipsContainer}>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, formData.propertyType === type && styles.chipActive]}
                onPress={() => setFormData(prev => ({ ...prev, propertyType: type }))}
              >
                <Home size={14} color={formData.propertyType === type ? '#FFFFFF' : '#64748B'} strokeWidth={2} />
                <Text style={[styles.chipText, formData.propertyType === type && styles.chipTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DollarSign size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Pricing</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Price"
            placeholderTextColor={Colors.text.light}
            value={formData.price}
            onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
            keyboardType="numeric"
          />

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.typeButton, formData.priceType === 'monthly' && styles.typeButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, priceType: 'monthly' }))}
            >
              <Text style={[styles.typeButtonText, formData.priceType === 'monthly' && styles.typeButtonTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, formData.priceType === 'sale' && styles.typeButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, priceType: 'sale' }))}
            >
              <Text style={[styles.typeButtonText, formData.priceType === 'sale' && styles.typeButtonTextActive]}>
                Sale
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowProvincePicker(!showProvincePicker)}
          >
            <MapPin size={18} color={Colors.text.secondary} />
            <Text style={styles.pickerButtonText}>{formData.province}</Text>
            <ChevronDown size={18} color={Colors.text.secondary} />
          </TouchableOpacity>

          {showProvincePicker && (
            <View style={styles.pickerContainer}>
              <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                {PROVINCES.map((province) => (
                  <TouchableOpacity
                    key={province}
                    style={styles.pickerItem}
                    onPress={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        province: province as Province,
                        city: getCitiesByProvince(province as Province)[0] || ''
                      }));
                      setShowProvincePicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{province}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCityPicker(!showCityPicker)}
          >
            <MapPin size={18} color={Colors.text.secondary} />
            <Text style={styles.pickerButtonText}>{formData.city || 'Select City'}</Text>
            <ChevronDown size={18} color={Colors.text.secondary} />
          </TouchableOpacity>

          {showCityPicker && (
            <View style={styles.pickerContainer}>
              <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
                {availableCities.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.pickerItem}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, city }));
                      setShowCityPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Area/Suburb (e.g., Borrowdale, Mount Pleasant)"
            placeholderTextColor={Colors.text.light}
            value={formData.area}
            onChangeText={(text) => setFormData(prev => ({ ...prev, area: text }))}
          />

          <TextInput
            style={styles.input}
            placeholder="Street Address (Optional)"
            placeholderTextColor={Colors.text.light}
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ruler size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Details</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Bed size={20} color={Colors.text.secondary} />
              <TextInput
                style={styles.detailInput}
                placeholder="Beds"
                placeholderTextColor={Colors.text.light}
                value={formData.bedrooms}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bedrooms: text }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.detailItem}>
              <Bath size={20} color={Colors.text.secondary} />
              <TextInput
                style={styles.detailInput}
                placeholder="Baths"
                placeholderTextColor={Colors.text.light}
                value={formData.bathrooms}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bathrooms: text }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.detailItem}>
              <Ruler size={20} color={Colors.text.secondary} />
              <TextInput
                style={styles.detailInput}
                placeholder="Area (sqm)"
                placeholderTextColor={Colors.text.light}
                value={formData.propertyArea}
                onChangeText={(text) => setFormData(prev => ({ ...prev, propertyArea: text }))}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Car size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Facilities</Text>
          </View>
          <View style={styles.chipsContainer}>
            {facilities.map((facility) => (
              <TouchableOpacity
                key={facility}
                style={[styles.chip, selectedFacilities.includes(facility) && styles.chipActive]}
                onPress={() => toggleFacility(facility)}
              >
                {facility === 'Pool' && <Waves size={14} color={selectedFacilities.includes(facility) ? '#FFFFFF' : '#64748B'} strokeWidth={2} />}
                {facility === 'Garage' && <Car size={14} color={selectedFacilities.includes(facility) ? '#FFFFFF' : '#64748B'} strokeWidth={2} />}
                {facility === 'Bath' && <Bath size={14} color={selectedFacilities.includes(facility) ? '#FFFFFF' : '#64748B'} strokeWidth={2} />}
                {!['Pool', 'Garage', 'Bath'].includes(facility) && <Home size={14} color={selectedFacilities.includes(facility) ? '#FFFFFF' : '#64748B'} strokeWidth={2} />}
                <Text style={[styles.chipText, selectedFacilities.includes(facility) && styles.chipTextActive]}>
                  {facility}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Tags</Text>
          </View>
          <View style={styles.chipsContainer}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.chip, selectedTags.includes(tag) && styles.chipActive]}
                onPress={() => toggleTag(tag)}
              >
                <Tag size={14} color={selectedTags.includes(tag) ? '#FFFFFF' : '#64748B'} strokeWidth={2} />
                <Text style={[styles.chipText, selectedTags.includes(tag) && styles.chipTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (!canSave || isSubmitting) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Creating...' : 'Save Property'}
          </Text>
        </TouchableOpacity>
      </View>
      <SuccessPrompt
        visible={showSuccess}
        message="Property Listed Successfully!"
        onClose={() => setShowSuccess(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    outlineStyle: 'none' as const,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  row: {
    flexDirection: 'row' as const,
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  typeButtonTextActive: {
    color: Colors.white,
  },
  detailsGrid: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  detailInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    padding: 0,
    outlineStyle: 'none' as const,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  saveButton: {
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  imageScroll: {
    marginBottom: 12,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: 'dashed' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
    backgroundColor: Colors.gray[50],
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative' as const,
    marginRight: 12,
  },
  propertyImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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
    backgroundColor: Colors.gray[100],
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  chipTextActive: {
    color: Colors.white,
  },
  cityButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 6,
    justifyContent: 'center' as const,
  },
  cityButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  cityButtonTextActive: {
    color: Colors.white,
  },
  pickerButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    marginBottom: 12,
    gap: 10,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },
  pickerContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
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
    borderBottomColor: Colors.gray[100],
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500' as const,
  },
});
