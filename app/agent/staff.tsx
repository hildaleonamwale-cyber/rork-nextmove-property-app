import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Users,
  Plus,
  Mail,
  Phone,
  Edit2,
  Trash2,
  X,
  UserCircle,
  Camera,

} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAgent } from '@/contexts/AgentContext';
import { useSupabaseStaff } from '@/hooks/useSupabaseAgent';

export default function StaffScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile: agentProfile } = useAgent();
  const { staff: staffData, isLoading: staffLoading, addStaff, updateStaff, removeStaff } = useSupabaseStaff(agentProfile?.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    email: '',
    phone: '',
    whatsapp: '',
    avatar: '',
  });

  const handleAddMember = async () => {
    if (!formData.name) {
      Alert.alert('Missing Information', 'Please provide a name for the staff member.');
      return;
    }

    try {
      await addStaff({
        name: formData.name,
        role: formData.role || 'Agent',
        email: formData.email,
        phone: formData.phone,
        permissions: [],
        active: true,
      });
      Alert.alert('Success', 'Staff member added successfully');
      resetForm();
    } catch (error) {
      console.error('Failed to add staff member:', error);
      Alert.alert('Error', 'Failed to add staff member. Please try again.');
    }
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    try {
      await updateStaff(editingMember, {
        name: formData.name || undefined,
        role: formData.role || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        permissions: [],
        active: true,
      });
      Alert.alert('Success', 'Staff member updated successfully');
      resetForm();
    } catch (error) {
      console.error('Failed to update staff member:', error);
      Alert.alert('Error', 'Failed to update staff member. Please try again.');
    }
  };

  const handleDeleteMember = async (id: string) => {
    Alert.alert(
      'Delete Staff Member',
      'Are you sure you want to delete this staff member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeStaff(id);
              Alert.alert('Success', 'Staff member deleted successfully');
            } catch (error) {
              console.error('Failed to remove staff member:', error);
              Alert.alert('Error', 'Failed to remove staff member. Please try again.');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (member: any) => {
    setEditingMember(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      description: '',
      email: member.email,
      phone: member.phone || '',
      whatsapp: '',
      avatar: '',
    });
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      description: '',
      email: '',
      phone: '',
      whatsapp: '',
      avatar: '',
    });
  };

  const pickAvatar = async () => {
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
      setFormData({ ...formData, avatar: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Management</Text>
        <TouchableOpacity
          style={styles.addHeaderButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Users size={24} color={Colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Team Display</Text>
            <Text style={styles.infoText}>
              Add and display your team members on your Pro agent profile. Show clients who they&apos;ll be working with.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{staffData?.length || 0}</Text>
            <Text style={styles.statLabel}>Team Members</Text>
          </View>
        </View>

        {staffLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Loading...</Text>
          </View>
        ) : staffData?.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={64} color={Colors.text.light} />
            <Text style={styles.emptyTitle}>No Team Members</Text>
            <Text style={styles.emptyText}>
              Add your first team member to display on your profile
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color={Colors.white} />
              <Text style={styles.emptyButtonText}>Add First Member</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.membersList}>
            {staffData?.map((member: any) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberLeft}>
                  <View style={styles.avatarContainer}>
                    {member.avatar ? (
                      <Image source={{ uri: member.avatar }} style={styles.avatar} />
                    ) : (
                      <UserCircle size={48} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                    <View style={styles.memberContacts}>
                      {member.email && (
                        <View style={styles.contactRow}>
                          <Mail size={14} color={Colors.text.light} />
                          <Text style={styles.contactText}>{member.email}</Text>
                        </View>
                      )}
                      {member.phone && (
                        <View style={styles.contactRow}>
                          <Phone size={14} color={Colors.text.light} />
                          <Text style={styles.contactText}>{member.phone}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(member)}
                  >
                    <Edit2 size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteMember(member.id)}
                  >
                    <Trash2 size={18} color='#EF4444' />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showAddModal || editingMember !== null}
        transparent
        animationType="slide"
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Profile Picture (Optional)</Text>
                <TouchableOpacity style={styles.avatarPicker} onPress={pickAvatar}>
                  {formData.avatar ? (
                    <Image source={{ uri: formData.avatar }} style={styles.avatarPreview} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Camera size={32} color={Colors.text.light} />
                      <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.text.light}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Senior Agent, Property Manager, etc."
                  placeholderTextColor={Colors.text.light}
                  value={formData.role}
                  onChangeText={(text) => setFormData({ ...formData, role: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Brief bio or description..."
                  placeholderTextColor={Colors.text.light}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor={Colors.text.light}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+1 234 567 8900"
                  placeholderTextColor={Colors.text.light}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>WhatsApp (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+1 234 567 8900"
                  placeholderTextColor={Colors.text.light}
                  value={formData.whatsapp}
                  onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={editingMember ? handleEditMember : handleAddMember}
              >
                <Text style={styles.submitButtonText}>
                  {editingMember ? 'Update Member' : 'Add Member'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addHeaderButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row' as const,
    backgroundColor: `${Colors.primary}10`,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 14,
    alignItems: 'center' as const,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  emptyState: {
    backgroundColor: Colors.white,
    padding: 48,
    borderRadius: 20,
    alignItems: 'center' as const,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  memberLeft: {
    flexDirection: 'row' as const,
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
  avatar: {
    width: 48,
    height: 48,
  },
  memberInfo: {
    flex: 1,
    gap: 6,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  memberRole: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  memberContacts: {
    gap: 4,
  },
  contactRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  contactText: {
    fontSize: 12,
    color: Colors.text.light,
  },
  memberActions: {
    flexDirection: 'row' as const,
    gap: 8,
    alignItems: 'flex-start' as const,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 16,
  },
  avatarPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden' as const,
    alignSelf: 'center' as const,
  },
  avatarPreview: {
    width: '100%' as const,
    height: '100%' as const,
  },
  avatarPlaceholder: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: 'dashed' as const,
  },
  avatarPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.light,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
