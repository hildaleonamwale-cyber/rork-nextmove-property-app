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
import { ArrowLeft, User, Building2, Globe, Mail, Phone, MapPin, Eye, Camera, ImageIcon, Linkedin, Twitter, Instagram, Facebook, Plus, Trash2, Edit3, X, ExternalLink } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAgent } from '@/contexts/AgentContext';
import SuccessPrompt from '@/components/SuccessPrompt';
import { ProfileCard } from '@/types/property';
import { mockProperties } from '@/mocks/properties';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAgent();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    companyName: profile?.companyName || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    website: profile?.website || '',
    address: profile?.address || '',
    specialties: profile?.specialties || [],
    socialMedia: {
      linkedin: profile?.socialMedia?.linkedin || '',
      twitter: profile?.socialMedia?.twitter || '',
      instagram: profile?.socialMedia?.instagram || '',
      facebook: profile?.socialMedia?.facebook || '',
    },
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [profileCards, setProfileCards] = useState<ProfileCard[]>([]);
  const [editingCard, setEditingCard] = useState<ProfileCard | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);

  const availableSpecialties = [
    'Residential',
    'Commercial',
    'Luxury',
    'Investment',
    'Rental',
    'Land',
    'Vacation Homes',
    'New Construction',
    'Property Owner',
    'Other',
  ];

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const pickProfilePicture = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const pickBannerImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setBannerImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      console.log('Updating agent profile with:', formData);
      
      await updateProfile({
        companyName: formData.companyName,
        bio: formData.bio,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address: formData.address,
        specialties: formData.specialties,
        socialMedia: formData.socialMedia,
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCard = () => {
    const newCard: ProfileCard = {
      id: Date.now().toString(),
      image: '',
      title: '',
      description: '',
      ctaText: 'View More',
      order: profileCards.length,
    };
    setEditingCard(newCard);
    setShowCardModal(true);
  };

  const editCard = (card: ProfileCard) => {
    setEditingCard(card);
    setShowCardModal(true);
  };

  const saveCard = () => {
    if (!editingCard) return;
    
    if (profileCards.find(c => c.id === editingCard.id)) {
      setProfileCards(profileCards.map(c => c.id === editingCard.id ? editingCard : c));
    } else {
      setProfileCards([...profileCards, editingCard]);
    }
    
    setShowCardModal(false);
    setEditingCard(null);
  };

  const deleteCard = (id: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setProfileCards(profileCards.filter(c => c.id !== id))
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() => setShowPreview(!showPreview)}
        >
          <Eye size={20} color={showPreview ? Colors.primary : Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showPreview ? (
          <View style={styles.previewContainer}>
            <View style={styles.previewBanner}>
              <Text style={styles.previewBannerText}>Client Preview</Text>
            </View>

            <View style={styles.previewCard}>
              <View style={styles.previewIcon}>
                <Building2 size={32} color={Colors.primary} />
              </View>
              <Text style={styles.previewName}>{formData.companyName || 'Company Name'}</Text>
              {formData.bio && <Text style={styles.previewBio}>{formData.bio}</Text>}
              
              {formData.specialties.length > 0 && (
                <View style={styles.previewSpecialties}>
                  {formData.specialties.map((specialty) => (
                    <View key={specialty} style={styles.previewTag}>
                      <Text style={styles.previewTagText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              )}

              {(formData.email || formData.phone) && (
                <View style={styles.previewContact}>
                  {formData.email && (
                    <View style={styles.previewContactItem}>
                      <Mail size={16} color={Colors.text.secondary} />
                      <Text style={styles.previewContactText}>{formData.email}</Text>
                    </View>
                  )}
                  {formData.phone && (
                    <View style={styles.previewContactItem}>
                      <Phone size={16} color={Colors.text.secondary} />
                      <Text style={styles.previewContactText}>{formData.phone}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ImageIcon size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Profile Images</Text>
              </View>

              <Text style={styles.subsectionTitle}>Profile Picture</Text>
              <TouchableOpacity style={styles.profileImageButton} onPress={pickProfilePicture}>
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} style={styles.profileImagePreview} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Camera size={32} color={Colors.text.light} />
                    <Text style={styles.imageButtonText}>Select Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.subsectionTitle}>Banner Image</Text>
              <TouchableOpacity style={styles.bannerImageButton} onPress={pickBannerImage}>
                {bannerImage ? (
                  <Image source={{ uri: bannerImage }} style={styles.bannerImagePreview} />
                ) : (
                  <View style={styles.bannerImagePlaceholder}>
                    <ImageIcon size={32} color={Colors.text.light} />
                    <Text style={styles.imageButtonText}>Select Banner</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Building2 size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Company Information</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Company Name"
                placeholderTextColor={Colors.text.light}
                value={formData.companyName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Bio"
                placeholderTextColor={Colors.text.light}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <User size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Contact Information</Text>
              </View>

              <View style={styles.inputWithIcon}>
                <Mail size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Email"
                  placeholderTextColor={Colors.text.light}
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWithIcon}>
                <Phone size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Phone"
                  placeholderTextColor={Colors.text.light}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputWithIcon}>
                <Globe size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Website"
                  placeholderTextColor={Colors.text.light}
                  value={formData.website}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Address"
                  placeholderTextColor={Colors.text.light}
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Globe size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Social Media</Text>
              </View>

              <View style={styles.inputWithIcon}>
                <Linkedin size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.inputField}
                  placeholder="LinkedIn URL"
                  placeholderTextColor={Colors.text.light}
                  value={formData.socialMedia.linkedin}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, linkedin: text } }))}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWithIcon}>
                <Twitter size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Twitter/X URL"
                  placeholderTextColor={Colors.text.light}
                  value={formData.socialMedia.twitter}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, twitter: text } }))}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWithIcon}>
                <Instagram size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Instagram URL"
                  placeholderTextColor={Colors.text.light}
                  value={formData.socialMedia.instagram}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, instagram: text } }))}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWithIcon}>
                <Facebook size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Facebook URL"
                  placeholderTextColor={Colors.text.light}
                  value={formData.socialMedia.facebook}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, socialMedia: { ...prev.socialMedia, facebook: text } }))}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {profile?.package === 'agency' && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <ImageIcon size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Featured Cards</Text>
                  <Text style={styles.sectionSubtitle}>(Agency Only)</Text>
                </View>
                <Text style={styles.helperText}>
                  Add custom cards to showcase properties, offers, or services on your profile.
                </Text>
                
                <View style={styles.cardsPreviewList}>
                  {profileCards.map((card, index) => (
                    <View key={card.id} style={styles.cardPreviewItem}>
                      <View style={styles.cardPreviewLeft}>
                        {card.image ? (
                          <Image source={{ uri: card.image }} style={styles.cardPreviewImage} />
                        ) : (
                          <View style={styles.cardPreviewImagePlaceholder}>
                            <ImageIcon size={20} color={Colors.text.light} />
                          </View>
                        )}
                        <View style={styles.cardPreviewInfo}>
                          <Text style={styles.cardPreviewTitle} numberOfLines={1}>
                            {card.title || 'Untitled Card'}
                          </Text>
                          <Text style={styles.cardPreviewDesc} numberOfLines={1}>
                            {card.description || 'No description'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.cardPreviewActions}>
                        <TouchableOpacity
                          style={styles.cardActionButton}
                          onPress={() => editCard(card)}
                        >
                          <Edit3 size={18} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cardActionButton}
                          onPress={() => deleteCard(card.id)}
                        >
                          <Trash2 size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.addCardButton} onPress={addCard}>
                  <Plus size={20} color={Colors.white} />
                  <Text style={styles.addCardButtonText}>Add Card</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Building2 size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Specialties</Text>
              </View>

              <View style={styles.specialtiesGrid}>
                {availableSpecialties.map((specialty) => {
                  const isSelected = formData.specialties.includes(specialty);
                  return (
                    <TouchableOpacity
                      key={specialty}
                      style={[styles.specialtyChip, isSelected && styles.specialtyChipSelected]}
                      onPress={() => toggleSpecialty(specialty)}
                    >
                      <Text style={[styles.specialtyText, isSelected && styles.specialtyTextSelected]}>
                        {specialty}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      {showCardModal && editingCard && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Card</Text>
              <TouchableOpacity onPress={() => setShowCardModal(false)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} bounces={false}>
              <Text style={[styles.modalLabel, { marginTop: 0 }]}>Card Image</Text>
              <TouchableOpacity 
                style={styles.imagePickerButton} 
                onPress={async () => {
                  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  
                  if (permissionResult.granted === false) {
                    if (Platform.OS === 'web') {
                      alert('Please allow access to your photo library.');
                    } else {
                      Alert.alert('Permission Required', 'Please allow access to your photo library.');
                    }
                    return;
                  }

                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.8,
                  });

                  if (!result.canceled) {
                    setEditingCard({ ...editingCard, image: result.assets[0].uri });
                  }
                }}
              >
                {editingCard.image ? (
                  <Image 
                    source={{ uri: editingCard.image }} 
                    style={styles.modalImagePreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <ImageIcon size={32} color={Colors.text.light} />
                    <Text style={styles.imagePickerText}>Select Image from Gallery</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={styles.modalLabel}>Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Card title"
                placeholderTextColor={Colors.text.light}
                value={editingCard.title}
                onChangeText={(text) => setEditingCard({ ...editingCard, title: text })}
              />

              <Text style={styles.modalLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Brief description..."
                placeholderTextColor={Colors.text.light}
                value={editingCard.description}
                onChangeText={(text) => setEditingCard({ ...editingCard, description: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.modalLabel}>Button Text</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., View Property, Learn More"
                placeholderTextColor={Colors.text.light}
                value={editingCard.ctaText}
                onChangeText={(text) => setEditingCard({ ...editingCard, ctaText: text })}
              />

              <Text style={styles.modalLabel}>Link to Property (Optional)</Text>
              <View style={styles.propertyPicker}>
                <Text style={styles.propertyPickerLabel}>Select a property:</Text>
                <View style={styles.propertyPickerOptions}>
                  {mockProperties.slice(0, 5).map(prop => (
                    <TouchableOpacity
                      key={prop.id}
                      style={[
                        styles.propertyOption,
                        editingCard.propertyId === prop.id && styles.propertyOptionSelected
                      ]}
                      onPress={() => setEditingCard({ ...editingCard, propertyId: prop.id, ctaLink: undefined })}
                    >
                      <Text style={[
                        styles.propertyOptionText,
                        editingCard.propertyId === prop.id && styles.propertyOptionTextSelected
                      ]} numberOfLines={1}>
                        {prop.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {editingCard.propertyId && (
                    <TouchableOpacity
                      style={styles.clearPropertyButton}
                      onPress={() => setEditingCard({ ...editingCard, propertyId: undefined })}
                    >
                      <Text style={styles.clearPropertyButtonText}>Clear Selection</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <Text style={styles.modalLabel}>Or External Link (Optional)</Text>
              <View style={styles.inputWithIcon}>
                <ExternalLink size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.inputField}
                  placeholder="https://example.com"
                  placeholderTextColor={Colors.text.light}
                  value={editingCard.ctaLink}
                  onChangeText={(text) => setEditingCard({ ...editingCard, ctaLink: text, propertyId: undefined })}
                  autoCapitalize="none"
                  editable={!editingCard.propertyId}
                />
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowCardModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveButton} 
                onPress={saveCard}
              >
                <Text style={styles.modalSaveButtonText}>Save Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <SuccessPrompt
        visible={showSuccess}
        message="Profile Updated Successfully!"
        onClose={() => setShowSuccess(false)}
      />
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
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
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
  previewButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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
  inputWithIcon: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    padding: 0,
    outlineStyle: 'none' as const,
  },
  specialtiesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  specialtyChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  specialtyChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  specialtyTextSelected: {
    color: Colors.white,
  },
  previewContainer: {
    flex: 1,
  },
  previewBanner: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center' as const,
  },
  previewBannerText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  previewCard: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center' as const,
  },
  previewIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  previewName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  previewBio: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 16,
  },
  previewSpecialties: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  previewTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  previewTagText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  previewContact: {
    width: '100%' as const,
    gap: 12,
    marginTop: 8,
  },
  previewContactItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.gray[50],
    borderRadius: 10,
  },
  previewContactText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 8,
    marginTop: 8,
  },
  profileImageButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden' as const,
    alignSelf: 'center' as const,
    marginBottom: 16,
  },
  profileImagePreview: {
    width: '100%' as const,
    height: '100%' as const,
  },
  profileImagePlaceholder: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: 'dashed' as const,
  },
  bannerImageButton: {
    width: '100%' as const,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  bannerImagePreview: {
    width: '100%' as const,
    height: '100%' as const,
  },
  bannerImagePlaceholder: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: 'dashed' as const,
    borderRadius: 12,
  },
  imageButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.light,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.white,
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
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  cardsPreviewList: {
    gap: 10,
    marginBottom: 16,
  },
  cardPreviewItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
  },
  cardPreviewLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  cardPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
  },
  cardPreviewImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardPreviewInfo: {
    flex: 1,
    gap: 4,
  },
  cardPreviewTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  cardPreviewDesc: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  cardPreviewActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  cardActionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.gray[50],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  addCardButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  addCardButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    width: '100%' as const,
    maxWidth: 500,
    maxHeight: '90%' as const,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden' as const,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    outlineStyle: 'none' as const,
  },
  modalTextArea: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: 'top' as const,
  },
  modalImagePreview: {
    width: '100%' as const,
    height: 150,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: Colors.gray[100],
  },
  modalFooter: {
    flexDirection: 'row' as const,
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  modalSaveButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  propertyPicker: {
    marginTop: 8,
    marginBottom: 12,
  },
  propertyPickerLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  propertyPickerOptions: {
    gap: 8,
  },
  propertyOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Colors.gray[50],
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent' as const,
  },
  propertyOptionSelected: {
    backgroundColor: `${Colors.primary}10`,
    borderColor: Colors.primary,
  },
  propertyOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  propertyOptionTextSelected: {
    color: Colors.primary,
  },
  clearPropertyButton: {
    paddingVertical: 10,
    alignItems: 'center' as const,
  },
  clearPropertyButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  imagePickerButton: {
    width: '100%' as const,
    minHeight: 150,
    borderRadius: 12,
    overflow: 'hidden' as const,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: 'dashed' as const,
    backgroundColor: Colors.gray[50],
  },
  imagePickerPlaceholder: {
    width: '100%' as const,
    height: 150,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
});
