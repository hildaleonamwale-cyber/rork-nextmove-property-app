import React, { useState, useCallback } from 'react';
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
  Clipboard,
} from 'react-native';
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
  Shield,
  UserCircle,
  Copy,
  Key,
  CheckCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAgentProfile } from '@/contexts/AgentProfileContext';
import { StaffMember } from '@/types/property';

export default function StaffScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, addStaffMember, updateStaffMember, removeStaffMember } = useAgentProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    permissions: [] as string[],
  });
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const generateInviteToken = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }, []);

  const handleAddMember = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Missing Information', 'Please provide name and email for the staff member.');
      return;
    }

    if (formData.permissions.length === 0) {
      Alert.alert('No Permissions', 'Please select at least one permission for the staff member.');
      return;
    }

    const inviteToken = generateInviteToken();
    const newMember: StaffMember = {
      id: Date.now().toString(),
      name: formData.name,
      role: formData.role || 'Agent',
      email: formData.email,
      phone: formData.phone,
      permissions: formData.permissions,
      active: false,
      inviteToken,
      inviteExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await addStaffMember(newMember);
    const link = `https://app.example.com/invite?token=${inviteToken}`;
    setInviteLink(link);
    setShowInviteModal(true);
    resetForm();
  };

  const handleEditMember = async () => {
    if (!editingMember) return;

    await updateStaffMember(editingMember, {
      name: formData.name || undefined,
      role: formData.role || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      permissions: formData.permissions.length > 0 ? formData.permissions : undefined,
    });

    resetForm();
  };

  const handleDeleteMember = async (id: string) => {
    await removeStaffMember(id);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingMember(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone || '',
      permissions: member.permissions || [],
    });
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingMember(null);
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: '',
      permissions: [],
    });
  };

  const copyToClipboard = async (text: string) => {
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(text);
    } else {
      Clipboard.setString(text);
    }
    Alert.alert('Copied!', 'Invite link copied to clipboard');
  };

  const sendInviteEmail = () => {
    Alert.alert(
      'Demo Mode',
      `In production, an invite email would be sent to ${formData.email} with the invite link.`,
      [{ text: 'OK' }]
    );
  };

  const togglePermission = (permission: string) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    setFormData({ ...formData, permissions: newPermissions });
  };

  const availablePermissions = [
    { id: 'manage_properties', label: 'Manage Properties' },
    { id: 'view_analytics', label: 'View Analytics' },
    { id: 'manage_bookings', label: 'Manage Bookings' },
    { id: 'respond_inquiries', label: 'Respond to Inquiries' },
    { id: 'edit_profile', label: 'Edit Profile' },
  ];

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
          <Plus size={24} color='#0019ff' />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Users size={24} color='#0019ff' />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Team Collaboration</Text>
            <Text style={styles.infoText}>
              Invite team members via email. They&apos;ll receive a secure link to create their account and join your agency dashboard.
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.staff.length}</Text>
            <Text style={styles.statLabel}>Team Members</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {profile.staff.filter(m => m.active).length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {profile.staff.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={64} color={Colors.text.light} />
            <Text style={styles.emptyTitle}>No Team Members</Text>
            <Text style={styles.emptyText}>
              Add your first team member to start collaborating on properties and client management
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
            {profile.staff.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.memberLeft}>
                  <View style={styles.avatarContainer}>
                    <UserCircle size={48} color='#0019ff' />
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {!member.active && (
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingText}>Pending</Text>
                        </View>
                      )}
                    </View>
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
                    {member.permissions && member.permissions.length > 0 && (
                      <View style={styles.permissionsContainer}>
                        <Shield size={14} color='#0019ff' />
                        <Text style={styles.permissionsText}>
                          {member.permissions.length} permission{member.permissions.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(member)}
                  >
                    <Edit2 size={18} color='#0019ff' />
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
                {editingMember ? 'Edit Team Member' : 'Invite Team Member'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <X size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                  placeholder="Agent, Manager, Assistant, etc."
                  placeholderTextColor={Colors.text.light}
                  value={formData.role}
                  onChangeText={(text) => setFormData({ ...formData, role: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
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
                <Text style={styles.label}>Permissions *</Text>
                <Text style={styles.hint}>Select at least one permission</Text>
                <View style={styles.permissionsGrid}>
                  {availablePermissions.map((permission) => (
                    <TouchableOpacity
                      key={permission.id}
                      style={[
                        styles.permissionChip,
                        formData.permissions.includes(permission.id) && styles.permissionChipActive,
                      ]}
                      onPress={() => togglePermission(permission.id)}
                    >
                      <Text
                        style={[
                          styles.permissionChipText,
                          formData.permissions.includes(permission.id) && styles.permissionChipTextActive,
                        ]}
                      >
                        {permission.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={editingMember ? handleEditMember : handleAddMember}
              >
                <Text style={styles.submitButtonText}>
                  {editingMember ? 'Update Member' : 'Send Invitation'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showInviteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowInviteModal(false);
          setInviteLink(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModalContent}>
            <View style={styles.passwordModalHeader}>
              <View style={styles.successIconContainer}>
                <CheckCircle size={56} color="#10B981" strokeWidth={2.5} />
              </View>
              <Text style={styles.passwordModalTitle}>Invitation Created!</Text>
              <Text style={styles.passwordModalSubtitle}>
                An invite link has been generated. Send it to the staff member to complete setup.
              </Text>
            </View>

            <View style={styles.credentialsContainer}>
              <View style={styles.credentialRow}>
                <Mail size={20} color={Colors.text.secondary} />
                <View style={styles.credentialContent}>
                  <Text style={styles.credentialLabel}>Invited Email</Text>
                  <Text style={styles.credentialValue}>{formData.email}</Text>
                </View>
              </View>

              <View style={styles.credentialRow}>
                <Key size={20} color={Colors.text.secondary} />
                <View style={styles.credentialContent}>
                  <Text style={styles.credentialLabel}>Invite Link</Text>
                  <View style={styles.passwordValueContainer}>
                    <Text style={styles.credentialValue} numberOfLines={1} ellipsizeMode="middle">{inviteLink}</Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => copyToClipboard(inviteLink!)}
                    >
                      <Copy size={18} color="#0019ff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ℹ️ The invite link will expire in 7 days. Staff member will create their own password during signup.
              </Text>
            </View>

            <View style={styles.passwordModalActions}>
              <TouchableOpacity
                style={styles.sendEmailButton}
                onPress={sendInviteEmail}
              >
                <Mail size={20} color={Colors.white} />
                <Text style={styles.copyAllButtonText}>Send Email Invite (Demo)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.copyAllButton}
                onPress={() => copyToClipboard(inviteLink!)}
              >
                <Copy size={20} color={Colors.white} />
                <Text style={styles.copyAllButtonText}>Copy Invite Link</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  setShowInviteModal(false);
                  setInviteLink(null);
                }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#0019ff10',
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
    color: '#0019ff',
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
    backgroundColor: '#0019ff',
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
    backgroundColor: '#0019ff10',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  memberInfo: {
    flex: 1,
    gap: 6,
  },
  memberNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F59E0B20',
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#F59E0B',
    textTransform: 'uppercase' as const,
  },
  memberRole: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#0019ff',
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
  permissionsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginTop: 4,
  },
  permissionsText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#0019ff',
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
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
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
  permissionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  permissionChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: Colors.gray[100],
  },
  permissionChipActive: {
    backgroundColor: '#0019ff10',
    borderColor: '#0019ff',
  },
  permissionChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  permissionChipTextActive: {
    color: '#0019ff',
  },
  submitButton: {
    backgroundColor: '#0019ff',
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
  hint: {
    fontSize: 12,
    color: Colors.text.light,
    marginTop: -4,
    marginBottom: 8,
  },
  passwordModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 32,
    padding: 40,
    width: '100%',
    maxWidth: 480,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  passwordModalHeader: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B98110',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
  },
  passwordModalTitle: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center' as const,
  },
  passwordModalSubtitle: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  credentialsContainer: {
    backgroundColor: Colors.gray[50],
    borderRadius: 15,
    padding: 24,
    gap: 20,
    marginBottom: 24,
  },
  credentialRow: {
    flexDirection: 'row' as const,
    gap: 16,
    alignItems: 'center' as const,
  },
  credentialContent: {
    flex: 1,
  },
  credentialLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.text.light,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  credentialValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  passwordValueContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  copyButton: {
    padding: 8,
    backgroundColor: '#0019ff10',
    borderRadius: 100,
    minWidth: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  warningBox: {
    backgroundColor: '#E0F2FE',
    padding: 20,
    borderRadius: 15,
    marginBottom: 28,
  },
  warningText: {
    fontSize: 13,
    color: '#0C4A6E',
    lineHeight: 20,
    textAlign: 'center' as const,
  },
  passwordModalActions: {
    gap: 14,
  },
  sendEmailButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 100,
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  copyAllButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#0019ff',
    paddingVertical: 18,
    borderRadius: 100,
    gap: 10,
    shadowColor: '#0019ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  copyAllButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  doneButton: {
    alignItems: 'center' as const,
    paddingVertical: 18,
    borderRadius: 100,
    backgroundColor: Colors.gray[50],
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    letterSpacing: 0.3,
  },
});
