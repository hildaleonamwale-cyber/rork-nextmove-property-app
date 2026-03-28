import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Home, DollarSign, MapPin, Bed, Bath, Ruler, ImageIcon, Plus, Car, Waves, Tag, ChevronDown, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAgent } from '@/contexts/AgentContext';
import { supabase } from '@/lib/supabase';
import SuccessPrompt from '@/components/SuccessPrompt';
import { PROVINCES, getCitiesByProvince, Province } from '@/constants/locations';
import { uploadPropertyImages } from '@/utils/supabase-storage';
import { useSupabaseProperty } from '@/hooks/useSupabaseProperties';

export default function EditPropertyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const propertyId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const insets = useSafeAreaInsets();
  const { profile } = useAgent();
  const { property, isLoading: isLoadingProperty } = useSupabaseProperty(propertyId);
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

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        price: property.price?.toString() || '',
        priceType: property.priceType === 'monthly' ? 'monthly' : 'sale',
        address: property.location?.address || '',
        area: property.location?.area || '',
        city: property.location?.city || 'Harare',
        province: (property.location?.province || 'Harare') as Province,
        country: property.location?.country || 'Zimbabwe',
        bedrooms: (property as any).bedrooms?.toString() || '',
        bathrooms: (property as any).bathrooms?.toString() || '',
        propertyArea: property.area?.toString() || '',
        propertyType: (property as any).propertyType || 'Full House',
        status: property.status,
      });
      setSelectedImages(property.images || []);
      setSelectedFacilities((property as any).amenities || []);
    }
  }, [property]);

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

  const handleSubmit = async () => {
    if (!profile?.id) {
      Alert.alert('Error', 'Agent profile not found. Please complete agent setup first.');
      return;
    }

    if (!formData.title || !formData.description || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      const imagesToUpload = selectedImages.filter(img => img.startsWith('file://'));
      const existingImages = selectedImages.filter(img => !img.startsWith('file://'));

      let uploadedImages: string[] = [];
      if (imagesToUpload.length > 0) {
        console.log('Uploading new images...');
        uploadedImages = await uploadPropertyImages(imagesToUpload, profile.id);
      }

      const allImages = [...existingImages, ...uploadedImages];

      const propertyData = {
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyType,
        listing_category: 'property',
        status: formData.status,
        price: parseFloat(formData.price),
        price_type: formData.priceType === 'monthly' ? 'monthly' : 'total',
        images: JSON.stringify(allImages),
        area: parseFloat(formData.propertyArea) || 0,
        area_unit: 'm²',
        furnished: selectedTags.includes('Furnished'),
        parking: selectedFacilities.includes('Garage') || selectedFacilities.includes('Car'),
        amenities: JSON.stringify(selectedFacilities),
        address: formData.address,
        city: formData.city,
        state: formData.province,
        country: formData.country,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
      };

      console.log('Updating property:', propertyData);

      const { error: updateError } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', propertyId);

      if (updateError) {
        console.error('Property update error:', updateError);
        throw updateError;
      }

      console.log('Property updated successfully');
      setShowSuccess(true);

      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (error) {
      console.error('Failed to update property:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update property. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperty) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  const cities = getCitiesByProvince(formData.province);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Property</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Property Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="e.g., Beautiful 3 Bedroom House"
              placeholderTextColor={Colors.text.light}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe the property..."
              placeholderTextColor={Colors.text.light}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Price *</Text>
              <View style={styles.inputWithIcon}>
                <DollarSign size={20} color={Colors.text.secondary} />
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding]}
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text.replace(/[^0-9.]/g, '') }))}
                  placeholder="0.00"
                  placeholderTextColor={Colors.text.light}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Price Type</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setFormData(prev => ({ ...prev, priceType: prev.priceType === 'monthly' ? 'sale' : 'monthly' }))}
              >
                <Text style={styles.pickerText}>{formData.priceType === 'monthly' ? 'Monthly' : 'Sale'}</Text>
                <ChevronDown size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Property Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    formData.propertyType === type && styles.typeChipActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      formData.propertyType === type && styles.typeChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
              {['For Rent', 'For Sale', 'Internal Management'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.typeChip,
                    formData.status === status && styles.typeChipActive,
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, status: status as any }))}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      formData.status === status && styles.typeChipTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Details</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Bedrooms</Text>
              <View style={styles.inputWithIcon}>
                <Bed size={20} color={Colors.text.secondary} />
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding]}
                  value={formData.bedrooms}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bedrooms: text.replace(/[^0-9]/g, '') }))}
                  placeholder="0"
                  placeholderTextColor={Colors.text.light}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Bathrooms</Text>
              <View style={styles.inputWithIcon}>
                <Bath size={20} color={Colors.text.secondary} />
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding]}
                  value={formData.bathrooms}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bathrooms: text.replace(/[^0-9]/g, '') }))}
                  placeholder="0"
                  placeholderTextColor={Colors.text.light}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Area (m²)</Text>
              <View style={styles.inputWithIcon}>
                <Ruler size={20} color={Colors.text.secondary} />
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding]}
                  value={formData.propertyArea}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, propertyArea: text.replace(/[^0-9]/g, '') }))}
                  placeholder="0"
                  placeholderTextColor={Colors.text.light}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={Colors.text.secondary} />
              <TextInput
                style={[styles.input, styles.inputWithIconPadding]}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                placeholder="Street address"
                placeholderTextColor={Colors.text.light}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Province</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowProvincePicker(!showProvincePicker)}
              >
                <Text style={styles.pickerText}>{formData.province}</Text>
                <ChevronDown size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
              {showProvincePicker && (
                <View style={styles.pickerOptions}>
                  {PROVINCES.map((province) => (
                    <TouchableOpacity
                      key={province}
                      style={styles.pickerOption}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, province: province as Province, city: getCitiesByProvince(province as Province)[0] }));
                        setShowProvincePicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{province}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>City</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowCityPicker(!showCityPicker)}
              >
                <Text style={styles.pickerText}>{formData.city}</Text>
                <ChevronDown size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
              {showCityPicker && (
                <View style={styles.pickerOptions}>
                  {cities.map((city) => (
                    <TouchableOpacity
                      key={city}
                      style={styles.pickerOption}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, city }));
                        setShowCityPicker(false);
                      }}
                    >
                      <Text style={styles.pickerOptionText}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.facilitiesGrid}>
            {facilities.map((facility) => (
              <TouchableOpacity
                key={facility}
                style={[
                  styles.facilityChip,
                  selectedFacilities.includes(facility) && styles.facilityChipActive,
                ]}
                onPress={() => toggleFacility(facility)}
              >
                <Text
                  style={[
                    styles.facilityText,
                    selectedFacilities.includes(facility) && styles.facilityTextActive,
                  ]}
                >
                  {facility}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Images *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.propertyImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <X size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
              <ImageIcon size={24} color={Colors.primary} />
              <Text style={styles.addImageText}>Add Photos</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>Update Property</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SuccessPrompt
        visible={showSuccess}
        message="Property Updated Successfully!"
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
  centered: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    fontSize: 15,
    color: Colors.text.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top' as const,
  },
  row: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  inputWithIcon: {
    position: 'relative' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  inputWithIconPadding: {
    paddingLeft: 44,
  },
  picker: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  pickerText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    maxHeight: 200,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  pickerOptionText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  typeContainer: {
    marginTop: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  typeChipTextActive: {
    color: Colors.white,
  },
  facilitiesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  facilityChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  facilityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  facilityText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  facilityTextActive: {
    color: Colors.white,
  },
  imagesContainer: {
    marginTop: 12,
  },
  imageWrapper: {
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  addImageText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 14,
    alignItems: 'center' as const,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
});
