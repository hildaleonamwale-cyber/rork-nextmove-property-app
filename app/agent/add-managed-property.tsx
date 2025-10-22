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
import { ArrowLeft, Save, Plus, X, ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useSupabaseManagedProperties } from '@/hooks/useSupabaseManagedProperties';
import { useAgent } from '@/contexts/AgentContext';
import { ManagedPropertyStatus, ManagedPropertyType } from '@/types/property';

export default function AddManagedPropertyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAgent();
  const { addProperty } = useSupabaseManagedProperties(profile?.id);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<ManagedPropertyType>('Residential');
  const [status, setStatus] = useState<ManagedPropertyStatus>('Vacant');
  const [notes, setNotes] = useState('');

  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      if (Platform.OS === 'web') {
        alert('Please allow access to your photo library to add images.');
      } else {
        Alert.alert('Permission Required', 'Please allow access to your photo library to add images.');
      }
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
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter a property name');
      } else {
        Alert.alert('Error', 'Please enter a property name');
      }
      return;
    }

    if (!address.trim()) {
      if (Platform.OS === 'web') {
        alert('Please enter an address');
      } else {
        Alert.alert('Error', 'Please enter an address');
      }
      return;
    }

    if (!profile?.id) {
      if (Platform.OS === 'web') {
        alert('No agent profile found');
      } else {
        Alert.alert('Error', 'No agent profile found');
      }
      return;
    }

    try {
      await addProperty({
        name: name.trim(),
        address: address.trim(),
        type,
        status,
        notes: notes.trim() || undefined,
        images: selectedImages,
        tenantName: tenantName.trim() || undefined,
        tenantPhone: tenantPhone.trim() || undefined,
        tenantEmail: tenantEmail.trim() || undefined,
        isListed: false,
      });
      router.back();
    } catch (error) {
      console.error('Failed to add property:', error);
      if (Platform.OS === 'web') {
        alert('Failed to add property. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to add property. Please try again.');
      }
    }
  };

  const propertyTypes: ManagedPropertyType[] = ['Residential', 'Commercial'];
  const statusOptions: ManagedPropertyStatus[] = ['Vacant', 'Occupied', 'Under Maintenance', 'For Sale'];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Property</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ImageIcon size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Property Photos</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Add photos of the property for internal reference
          </Text>

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
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Property Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Sunset Villa, Oak Street Apartment"
              placeholderTextColor={Colors.text.light}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter full address"
              placeholderTextColor={Colors.text.light}
              multiline
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Property Type</Text>
            <View style={styles.optionsRow}>
              {propertyTypes.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.optionButton,
                    type === item && styles.optionButtonActive
                  ]}
                  onPress={() => setType(item)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    type === item && styles.optionButtonTextActive
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionsRow}>
                {statusOptions.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.optionButton,
                      status === item && styles.optionButtonActive
                    ]}
                    onPress={() => setStatus(item)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      status === item && styles.optionButtonTextActive
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Internal Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any internal notes or reminders"
              placeholderTextColor={Colors.text.light}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tenant Details (Optional)</Text>
          <Text style={styles.sectionDescription}>
            Add tenant information if this property is occupied
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tenant Name</Text>
            <TextInput
              style={styles.input}
              value={tenantName}
              onChangeText={setTenantName}
              placeholder="Enter tenant name"
              placeholderTextColor={Colors.text.light}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tenant Phone</Text>
            <TextInput
              style={styles.input}
              value={tenantPhone}
              onChangeText={setTenantPhone}
              placeholder="Enter phone number"
              placeholderTextColor={Colors.text.light}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tenant Email</Text>
            <TextInput
              style={styles.input}
              value={tenantEmail}
              onChangeText={setTenantEmail}
              placeholder="Enter email address"
              placeholderTextColor={Colors.text.light}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color={Colors.white} />
          <Text style={styles.saveButtonText}>Save Property</Text>
        </TouchableOpacity>

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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    padding: 20,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  formGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top' as const,
  },
  optionsRow: {
    flexDirection: 'row' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: Colors.gray[50],
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
  },
  optionButtonTextActive: {
    color: Colors.white,
  },
  saveButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 100,
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  sectionHeaderRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 4,
  },
  imageScroll: {
    marginVertical: 8,
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
});
