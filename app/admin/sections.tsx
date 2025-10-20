import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Modal,
  Alert,
  Switch,
  Image,
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
  Layout,
  Grid,
  ListFilter,
  BarChart3,
  MousePointerClick,
  CheckSquare,
  Square,
  ChevronUp,
  ChevronDown,
} from 'lucide-react-native';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import type { HomepageSection } from '@/contexts/SuperAdminContext';
import { mockProperties } from '@/mocks/properties';
import Colors from '@/constants/colors';

export default function SectionManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sections, updateSection, addSection, deleteSection } = useSuperAdmin();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState<HomepageSection | null>(null);
  const [formData, setFormData] = useState<Omit<HomepageSection, 'id'>>({
    type: 'custom',
    title: '',
    subtitle: '',
    icon: '🏠',
    enabled: true,
    order: 1,
    config: {
      filterType: 'all',
      layoutType: 'grid',
      limit: 20,
      selectedProperties: [],
    },
    analytics: {
      views: 0,
      clicks: 0,
    },
  });
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [tempSelectedProperties, setTempSelectedProperties] = useState<string[]>([]);

  const handleEdit = (section: HomepageSection) => {
    setSelectedSection(section);
    setFormData({
      type: section.type,
      title: section.title,
      subtitle: section.subtitle,
      icon: section.icon,
      enabled: section.enabled,
      order: section.order,
      config: section.config,
      analytics: section.analytics,
    });
    setEditModalVisible(true);
  };

  const handleAdd = () => {
    setSelectedSection(null);
    setFormData({
      type: 'custom',
      title: '',
      subtitle: '',
      icon: '🏠',
      enabled: true,
      order: sections.length + 1,
      config: {
        filterType: 'all',
        layoutType: 'grid',
        limit: 20,
        selectedProperties: [],
      },
      analytics: {
        views: 0,
        clicks: 0,
      },
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    if (selectedSection) {
      await updateSection(selectedSection.id, formData);
    } else {
      await addSection(formData);
    }

    setEditModalVisible(false);
    setSelectedSection(null);
  };

  const handleDelete = (sectionId: string) => {
    Alert.alert(
      'Delete Section',
      'Are you sure you want to delete this section?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSection(sectionId),
        },
      ]
    );
  };

  const handleToggleEnabled = async (section: HomepageSection) => {
    await updateSection(section.id, { enabled: !section.enabled });
  };

  const openPropertyPicker = () => {
    setTempSelectedProperties(formData.config.selectedProperties || []);
    setShowPropertyPicker(true);
  };

  const togglePropertySelection = (propertyId: string) => {
    setTempSelectedProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const savePropertySelection = () => {
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        selectedProperties: tempSelectedProperties,
      },
    });
    setShowPropertyPicker(false);
  };

  const moveSectionUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...sections];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    const updated = reordered.map((s, i) => ({ ...s, order: i + 1 }));
    await updateSection(updated[index].id, { order: updated[index].order });
    await updateSection(updated[index - 1].id, { order: updated[index - 1].order });
  };

  const moveSectionDown = async (index: number) => {
    if (index === sections.length - 1) return;
    const reordered = [...sections];
    [reordered[index + 1], reordered[index]] = [reordered[index], reordered[index + 1]];
    const updated = reordered.map((s, i) => ({ ...s, order: i + 1 }));
    await updateSection(updated[index].id, { order: updated[index].order });
    await updateSection(updated[index + 1].id, { order: updated[index + 1].order });
  };

  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 60 : insets.top + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Homepage Sections</Text>
            <Text style={styles.headerSubtitle}>Configure all sections & filters</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Plus size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Add Section</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {sortedSections.map((section, index) => (
            <View key={section.id} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionIcon}>{section.icon || '🏠'}</Text>
                  <View style={styles.sectionTitleContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <View style={styles.orderControls}>
                        <TouchableOpacity
                          style={[styles.orderBtn, index === 0 && styles.orderBtnDisabled]}
                          onPress={() => moveSectionUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp size={16} color={index === 0 ? Colors.gray[300] : Colors.text.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.orderBtn, index === sortedSections.length - 1 && styles.orderBtnDisabled]}
                          onPress={() => moveSectionDown(index)}
                          disabled={index === sortedSections.length - 1}
                        >
                          <ChevronDown size={16} color={index === sortedSections.length - 1 ? Colors.gray[300] : Colors.text.secondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {section.subtitle && (
                      <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                    )}
                    <Text style={styles.sectionType}>{section.type.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
                <View style={styles.sectionActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, section.enabled ? styles.actionBtnSuccess : styles.actionBtnGray]}
                    onPress={() => handleToggleEnabled(section)}
                  >
                    {section.enabled ? (
                      <Eye size={18} color={Colors.white} />
                    ) : (
                      <EyeOff size={18} color={Colors.white} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnPrimary]}
                    onPress={() => handleEdit(section)}
                  >
                    <Edit2 size={18} color={Colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDanger]}
                    onPress={() => handleDelete(section.id)}
                  >
                    <Trash2 size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>

              {section.analytics && (
                <View style={styles.analyticsRow}>
                  <View style={styles.analyticItem}>
                    <BarChart3 size={14} color={Colors.primary} />
                    <Text style={styles.analyticText}>
                      {section.analytics.views.toLocaleString()} views
                    </Text>
                  </View>
                  <View style={styles.analyticItem}>
                    <MousePointerClick size={14} color={Colors.success} />
                    <Text style={styles.analyticText}>
                      {section.analytics.clicks.toLocaleString()} clicks
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.sectionConfig}>
                <View style={styles.configItem}>
                  <ListFilter size={14} color={Colors.text.secondary} />
                  <Text style={styles.configText}>
                    Filter: {section.config.filterType || 'all'}
                  </Text>
                </View>
                <View style={styles.configItem}>
                  {section.config.layoutType === 'carousel' ? (
                    <Layout size={14} color={Colors.text.secondary} />
                  ) : (
                    <Grid size={14} color={Colors.text.secondary} />
                  )}
                  <Text style={styles.configText}>
                    Layout: {section.config.layoutType || 'grid'}
                  </Text>
                </View>
                {section.config.area && (
                  <View style={styles.configItem}>
                    <Text style={styles.configText}>📍 {section.config.area}</Text>
                  </View>
                )}
                {section.config.propertyType && (
                  <View style={styles.configItem}>
                    <Text style={styles.configText}>🏠 {section.config.propertyType}</Text>
                  </View>
                )}
                {section.config.filterType === 'manual' && section.config.selectedProperties && (
                  <View style={styles.configItem}>
                    <Text style={styles.configText}>
                      ✓ {section.config.selectedProperties.length} selected properties
                    </Text>
                  </View>
                )}
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
                {selectedSection ? 'Edit Section' : 'Add Section'}
              </Text>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Section Title</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Featured Properties"
                  placeholderTextColor={Colors.text.light}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Subtitle (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Hand-picked premium listings"
                  placeholderTextColor={Colors.text.light}
                  value={formData.subtitle}
                  onChangeText={(text) => setFormData({ ...formData, subtitle: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Icon (Emoji)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="🏠"
                  placeholderTextColor={Colors.text.light}
                  value={formData.icon}
                  onChangeText={(text) => setFormData({ ...formData, icon: text })}
                  maxLength={2}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Section Type</Text>
                <View style={styles.radioGroup}>
                  {['featured_properties', 'browse_properties', 'featured_agencies', 'custom'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.radioOption,
                        formData.type === type && styles.radioOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, type: type as any })}
                    >
                      <Text
                        style={[
                          styles.radioText,
                          formData.type === type && styles.radioTextActive,
                        ]}
                      >
                        {type.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Filter Type</Text>
                <View style={styles.radioGroup}>
                  {['all', 'featured', 'area', 'type', 'manual'].map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.radioOption,
                        formData.config.filterType === filter && styles.radioOptionActive,
                      ]}
                      onPress={() => setFormData({
                        ...formData,
                        config: { ...formData.config, filterType: filter as any },
                      })}
                    >
                      <Text
                        style={[
                          styles.radioText,
                          formData.config.filterType === filter && styles.radioTextActive,
                        ]}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {formData.config.filterType === 'area' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Area</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Downtown, Brooklyn, etc."
                    placeholderTextColor={Colors.text.light}
                    value={formData.config.area || ''}
                    onChangeText={(text) => setFormData({
                      ...formData,
                      config: { ...formData.config, area: text },
                    })}
                  />
                </View>
              )}

              {formData.config.filterType === 'type' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Property Type</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Apartment, House, Villa, etc."
                    placeholderTextColor={Colors.text.light}
                    value={formData.config.propertyType || ''}
                    onChangeText={(text) => setFormData({
                      ...formData,
                      config: { ...formData.config, propertyType: text },
                    })}
                  />
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Layout Type</Text>
                <View style={styles.radioGroup}>
                  {['grid', 'carousel'].map((layout) => (
                    <TouchableOpacity
                      key={layout}
                      style={[
                        styles.radioOption,
                        formData.config.layoutType === layout && styles.radioOptionActive,
                      ]}
                      onPress={() => setFormData({
                        ...formData,
                        config: { ...formData.config, layoutType: layout as any },
                      })}
                    >
                      <Text
                        style={[
                          styles.radioText,
                          formData.config.layoutType === layout && styles.radioTextActive,
                        ]}
                      >
                        {layout}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Limit</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="20"
                  placeholderTextColor={Colors.text.light}
                  keyboardType="numeric"
                  value={formData.config.limit?.toString() || ''}
                  onChangeText={(text) => setFormData({
                    ...formData,
                    config: { ...formData.config, limit: parseInt(text) || 20 },
                  })}
                />
              </View>

              {formData.config.filterType === 'manual' && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    Selected Properties ({formData.config.selectedProperties?.length || 0})
                  </Text>
                  <TouchableOpacity style={styles.pickerButton} onPress={openPropertyPicker}>
                    <Text style={styles.pickerButtonText}>Select Properties</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.formLabel}>Enabled</Text>
                  <Switch
                    value={formData.enabled}
                    onValueChange={(value) => setFormData({ ...formData, enabled: value })}
                    trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>
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

      <Modal
        visible={showPropertyPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPropertyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Properties</Text>
              <TouchableOpacity onPress={() => setShowPropertyPicker(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {mockProperties.map((property) => {
                const isSelected = tempSelectedProperties.includes(property.id);
                return (
                  <TouchableOpacity
                    key={property.id}
                    style={[styles.propertyPickerItem, isSelected && styles.propertyPickerItemSelected]}
                    onPress={() => togglePropertySelection(property.id)}
                  >
                    <View style={styles.propertyPickerCheckbox}>
                      {isSelected ? (
                        <CheckSquare size={24} color={Colors.primary} />
                      ) : (
                        <Square size={24} color={Colors.text.secondary} />
                      )}
                    </View>
                    <Image source={{ uri: property.images[0] }} style={styles.propertyPickerImage} />
                    <View style={styles.propertyPickerInfo}>
                      <Text style={styles.propertyPickerTitle} numberOfLines={1}>
                        {property.title}
                      </Text>
                      <Text style={styles.propertyPickerLocation}>
                        {property.location.city}
                      </Text>
                      <Text style={styles.propertyPickerPrice}>
                        ${property.price.toLocaleString()}{property.priceType === 'monthly' ? '/mo' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => setShowPropertyPicker(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={savePropertySelection}>
                <Text style={styles.modalBtnPrimaryText}>
                  Select {tempSelectedProperties.length} Properties
                </Text>
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
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sectionInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  sectionIcon: {
    fontSize: 28,
  },
  titleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 4,
  },
  orderControls: {
    flexDirection: 'row' as const,
    gap: 4,
  },
  orderBtn: {
    width: 28,
    height: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 6,
  },
  orderBtnDisabled: {
    opacity: 0.3,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  sectionType: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  sectionActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
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
  sectionConfig: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  configItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
  },
  configText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  analyticsRow: {
    flexDirection: 'row' as const,
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  analyticItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  analyticText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  pickerButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  pickerButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  propertyPickerItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.gray[50],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  propertyPickerItemSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  propertyPickerCheckbox: {
    marginRight: 12,
  },
  propertyPickerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    marginRight: 12,
  },
  propertyPickerInfo: {
    flex: 1,
  },
  propertyPickerTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  propertyPickerLocation: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  propertyPickerPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
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
  radioGroup: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  radioOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.gray[100],
    borderWidth: 2,
    borderColor: Colors.gray[200],
  },
  radioOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radioText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textTransform: 'capitalize' as const,
  },
  radioTextActive: {
    color: Colors.white,
  },
  switchRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
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
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  modalBtnSecondaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  modalBtnPrimary: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  modalBtnPrimaryText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
