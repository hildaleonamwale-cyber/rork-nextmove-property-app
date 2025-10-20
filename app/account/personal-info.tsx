import React, { useState, useCallback } from 'react';
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
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Camera } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import SuccessPrompt from '@/components/SuccessPrompt';
import DateTimePickerModal from '@/components/DateTimePickerModal';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [address, setAddress] = useState('123 Main St, New York, NY 10001');
  const [birthDate, setBirthDate] = useState(new Date(1990, 0, 15));
  const [profileImage, setProfileImage] = useState<string>('https://i.pravatar.cc/200?img=33');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = useCallback(() => {
    console.log('Saving personal info:', { name, email, phone, address, birthDate: birthDate.toLocaleDateString() });
    setShowSuccess(true);
  }, [name, email, phone, address, birthDate]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      if (Platform.OS === 'web') {
        alert('Permission to access photos is required!');
      } else {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: profileImage }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Camera size={20} color={Colors.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Tap camera to change photo</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputIcon}>
                <User size={20} color={Colors.text.secondary} />
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.text.light}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputIcon}>
                <Mail size={20} color={Colors.text.secondary} />
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={Colors.text.light}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputIcon}>
                <Phone size={20} color={Colors.text.secondary} />
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone"
                placeholderTextColor={Colors.text.light}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <View style={styles.inputIcon}>
                <Calendar size={20} color={Colors.text.secondary} />
              </View>
              <TouchableOpacity
                style={[styles.input, styles.dateInputButton]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateInputText}>
                  {birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={styles.inputIcon}>
                <MapPin size={20} color={Colors.text.secondary} />
              </View>
              <TextInput
                style={[styles.input, { minHeight: 56 }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                placeholderTextColor={Colors.text.light}
                multiline
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SuccessPrompt
        visible={showSuccess}
        message="Successfully Saved"
        onClose={() => setShowSuccess(false)}
      />

      <DateTimePickerModal
        visible={showDatePicker}
        mode="date"
        value={birthDate}
        onConfirm={(date) => {
          setBirthDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center' as const,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  avatarWrapper: {
    position: 'relative' as const,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 5,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cameraButton: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  changePhotoText: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  section: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputIcon: {
    position: 'absolute' as const,
    left: 16,
    top: 38,
    zIndex: 1,
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 10,
  },
  input: {
    fontSize: 15,
    color: Colors.text.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    outlineStyle: 'none' as const,
  },
  dateInputButton: {
    justifyContent: 'center' as const,
  },
  dateInputText: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 14,
    alignItems: 'center' as const,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
