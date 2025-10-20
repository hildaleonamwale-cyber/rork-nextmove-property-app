import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  Image as RNImage,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react-native';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import type { HomepageBanner } from '@/contexts/SuperAdminContext';
import Colors from '@/constants/colors';

export default function BannerManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { banners, updateBanner, addBanner, deleteBanner } = useSuperAdmin();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HomepageBanner | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    link: '',
  });

  const handleEdit = (banner: HomepageBanner) => {
    setSelectedBanner(banner);
    setFormData({
      imageUrl: banner.imageUrl,
      title: banner.title,
      link: banner.link,
    });
    setEditModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedBanner(null);
    setFormData({
      imageUrl: '',
      title: '',
      link: '',
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.imageUrl || !formData.title || !formData.link) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (selectedBanner) {
      await updateBanner(selectedBanner.id, formData);
    } else {
      await addBanner({
        ...formData,
        enabled: true,
        order: banners.length + 1,
      });
    }

    setEditModalVisible(false);
    setSelectedBanner(null);
  };

  const handleDelete = (bannerId: string) => {
    Alert.alert(
      'Delete Banner',
      'Are you sure you want to delete this banner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBanner(bannerId),
        },
      ]
    );
  };

  const handleToggleEnabled = async (banner: HomepageBanner) => {
    await updateBanner(banner.id, { enabled: !banner.enabled });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 60 : insets.top + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Homepage Banners</Text>
            <Text style={styles.headerSubtitle}>Manage Featured Agencies carousel</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Plus size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Add Banner</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {banners.map((banner) => (
            <View key={banner.id} style={styles.bannerCard}>
              <RNImage source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {banner.title}
                </Text>
              </View>
              <View style={styles.bannerInfo}>
                <View style={styles.bannerMeta}>
                  <ExternalLink size={14} color={Colors.text.secondary} />
                  <Text style={styles.bannerLink} numberOfLines={1}>
                    {banner.link}
                  </Text>
                </View>
                <View style={styles.bannerActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, banner.enabled ? styles.actionBtnSuccess : styles.actionBtnGray]}
                    onPress={() => handleToggleEnabled(banner)}
                  >
                    {banner.enabled ? (
                      <Eye size={18} color={Colors.white} />
                    ) : (
                      <EyeOff size={18} color={Colors.white} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPrimary]}
                    onPress={() => handleEdit(banner)}
                  >
                    <Edit2 size={18} color={Colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDanger]}
                    onPress={() => handleDelete(banner.id)}
                  >
                    <Trash2 size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setEditModalVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedBanner ? 'Edit Banner' : 'Add Banner'}
              </Text>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Image URL</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={Colors.text.light}
                  value={formData.imageUrl}
                  onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Title</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Banner Title"
                  placeholderTextColor={Colors.text.light}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Link</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="/properties/featured"
                  placeholderTextColor={Colors.text.light}
                  value={formData.link}
                  onChangeText={(text) => setFormData({ ...formData, link: text })}
                />
              </View>

              {formData.imageUrl ? (
                <View style={styles.previewContainer}>
                  <Text style={styles.formLabel}>Preview</Text>
                  <RNImage source={{ uri: formData.imageUrl }} style={styles.previewImage} />
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  bannerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%' as const,
    height: 180,
    backgroundColor: Colors.gray[200],
  },
  bannerOverlay: {
    position: 'absolute' as const,
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  bannerInfo: {
    padding: 16,
  },
  bannerMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  bannerLink: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    flex: 1,
  },
  bannerActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 10,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  actionBtnDanger: {
    backgroundColor: Colors.error,
  },
  actionBtnSuccess: {
    backgroundColor: '#10B981',
  },
  actionBtnGray: {
    backgroundColor: Colors.gray[400],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%' as const,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    outlineStyle: 'none' as const,
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewImage: {
    width: '100%' as const,
    height: 160,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
  },
  modalFooter: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
