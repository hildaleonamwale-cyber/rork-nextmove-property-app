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
import { X, CheckCircle, Building2, User, Briefcase, Camera, ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAgentProfile } from '@/contexts/AgentProfileContext';
import { useUser } from '@/contexts/UserContext';
import SuccessPrompt from '@/components/SuccessPrompt';

export default function AgentOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refetch: refetchUser } = useUser();
  const { profile, updateProfile, completeOnboarding } = useAgentProfile();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: profile.companyName || '',
    bio: profile.bio || '',
    phone: profile.phone || '',
    email: profile.email || '',
    specialties: profile.specialties || [],
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleComplete = async () => {
    try {
      console.log('Starting onboarding completion...');
      console.log('Form data:', formData);
      
      await updateProfile(formData);
      console.log('Profile updated');
      
      await completeOnboarding();
      console.log('Onboarding completed');
      
      await refetchUser();
      console.log('User refetched');
      
      setShowSuccess(true);
      setTimeout(() => {
        router.replace('/agent/dashboard' as any);
      }, 2500);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete setup. Please try again.');
    }
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

  const canProceed = () => {
    if (step === 1) return formData.companyName.trim().length > 0;
    if (step === 5) return formData.specialties.length > 0;
    return true;
  };

  const canSkip = () => {
    return step === 2 || step === 3 || step === 4;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Building2 size={48} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Company or Personal Brand</Text>
            <Text style={styles.stepDescription}>
              What name would you like clients to see?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Smith Real Estate or John Smith"
              placeholderTextColor={Colors.text.light}
              value={formData.companyName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, companyName: text }))}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Camera size={48} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Profile Picture</Text>
            <Text style={styles.stepDescription}>
              Add a professional photo (Optional)
            </Text>
            
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickProfilePicture}>
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.profilePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <User size={48} color={Colors.text.light} />
                  <Text style={styles.imagePlaceholderText}>Tap to select photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <ImageIcon size={48} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Profile Banner</Text>
            <Text style={styles.stepDescription}>
              Add a banner image for your profile (Optional)
            </Text>
            
            <TouchableOpacity style={styles.bannerPickerButton} onPress={pickBannerImage}>
              {bannerImage ? (
                <Image source={{ uri: bannerImage }} style={styles.bannerPreview} />
              ) : (
                <View style={styles.bannerPlaceholder}>
                  <ImageIcon size={48} color={Colors.text.light} />
                  <Text style={styles.imagePlaceholderText}>Tap to select banner</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <User size={48} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Tell Your Story</Text>
            <Text style={styles.stepDescription}>
              Share a brief bio (Optional)
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share your experience, expertise, and what makes you unique..."
              placeholderTextColor={Colors.text.light}
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <CheckCircle size={48} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Your Specialties</Text>
            <Text style={styles.stepDescription}>
              Select the property types you specialize in
            </Text>
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
                    {isSelected && <CheckCircle size={16} color={Colors.white} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setup Agent Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i <= step && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {canSkip() && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => {
              if (step < 5) {
                setStep(step + 1);
              }
            }}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled,
            step === 1 && styles.nextButtonFull,
          ]}
          onPress={() => {
            if (step < 5) {
              setStep(step + 1);
            } else {
              handleComplete();
            }
          }}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {step === 5 ? 'Complete Setup' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      <SuccessPrompt
        visible={showSuccess}
        message="Agent account created successfully!"
        onClose={() => setShowSuccess(false)}
        autoClose={false}
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
  progressContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
    paddingVertical: 24,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gray[200],
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 32,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  stepContainer: {
    alignItems: 'center' as const,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  input: {
    width: '100%' as const,
    backgroundColor: Colors.gray[50],
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent' as const,
  },
  textArea: {
    minHeight: 150,
    paddingTop: 16,
  },
  specialtiesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    justifyContent: 'center' as const,
    width: '100%' as const,
  },
  specialtyChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: 'transparent' as const,
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
  footer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 14,
    backgroundColor: Colors.gray[100],
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  nextButton: {
    flex: 2,
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
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.gray[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 14,
    backgroundColor: 'transparent' as const,
    borderWidth: 2,
    borderColor: Colors.gray[300],
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
  },
  imagePickerButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden' as const,
    alignSelf: 'center' as const,
  },
  profilePreview: {
    width: '100%' as const,
    height: '100%' as const,
  },
  imagePlaceholder: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: 'dashed' as const,
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.light,
  },
  bannerPickerButton: {
    width: '100%' as const,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden' as const,
  },
  bannerPreview: {
    width: '100%' as const,
    height: '100%' as const,
  },
  bannerPlaceholder: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: 'dashed' as const,
    borderRadius: 16,
  },
});
