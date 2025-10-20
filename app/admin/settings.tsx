import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  DollarSign,
  Lock,
  Bell,
  Save,
  BarChart3,
  Shield,
  Mail,
  Smartphone,
} from 'lucide-react-native';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import Colors from '@/constants/colors';

export default function SystemSettings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useSuperAdmin();
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState(settings);

  const handleSave = async () => {
    await updateSettings(formData);
    setHasChanges(false);
    Alert.alert('Success', 'Settings have been updated successfully');
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 60 : insets.top + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>System Settings</Text>
            <Text style={styles.headerSubtitle}>Configure app features & pricing</Text>
          </View>
          {hasChanges && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={18} color={Colors.white} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '15' }]}>
                <DollarSign size={20} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Banner Pricing</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Set pricing for featured agency banner placements
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="500"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="numeric"
                value={formData.bannerPricing.monthlyPrice.toString()}
                onChangeText={(text) =>
                  updateFormData({
                    bannerPricing: {
                      ...formData.bannerPricing,
                      monthlyPrice: parseFloat(text) || 0,
                    },
                  })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Yearly Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="5000"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="numeric"
                value={formData.bannerPricing.yearlyPrice.toString()}
                onChangeText={(text) =>
                  updateFormData({
                    bannerPricing: {
                      ...formData.bannerPricing,
                      yearlyPrice: parseFloat(text) || 0,
                    },
                  })
                }
              />
            </View>

            <View style={styles.savingsInfo}>
              <Text style={styles.savingsText}>
                Yearly savings:{' '}
                <Text style={styles.savingsValue}>
                  $
                  {(
                    formData.bannerPricing.monthlyPrice * 12 -
                    formData.bannerPricing.yearlyPrice
                  ).toLocaleString()}{' '}
                  (
                  {Math.round(
                    ((formData.bannerPricing.monthlyPrice * 12 -
                      formData.bannerPricing.yearlyPrice) /
                      (formData.bannerPricing.monthlyPrice * 12)) *
                      100
                  )}
                  % discount)
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIcon, { backgroundColor: '#8B5CF615' }]}>
                <Lock size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.sectionTitle}>Feature Gating</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Control feature access and limits for different tiers
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Properties (Free Tier)</Text>
              <TextInput
                style={styles.input}
                placeholder="3"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="numeric"
                value={formData.featureGating.maxPropertiesFree.toString()}
                onChangeText={(text) =>
                  updateFormData({
                    featureGating: {
                      ...formData.featureGating,
                      maxPropertiesFree: parseInt(text) || 0,
                    },
                  })
                }
              />
              <Text style={styles.inputHelp}>
                Free users can list up to this many properties
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Max Properties (Pro Tier)</Text>
              <TextInput
                style={styles.input}
                placeholder="50"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="numeric"
                value={formData.featureGating.maxPropertiesPro.toString()}
                onChangeText={(text) =>
                  updateFormData({
                    featureGating: {
                      ...formData.featureGating,
                      maxPropertiesPro: parseInt(text) || 0,
                    },
                  })
                }
              />
              <Text style={styles.inputHelp}>
                Pro users can list up to this many properties
              </Text>
            </View>

            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <View style={styles.switchLabelRow}>
                  <BarChart3 size={18} color={Colors.text.primary} />
                  <Text style={styles.switchLabel}>Analytics Enabled</Text>
                </View>
                <Text style={styles.switchDescription}>
                  Allow users to view property analytics and insights
                </Text>
              </View>
              <Switch
                value={formData.featureGating.analyticsEnabled}
                onValueChange={(value) =>
                  updateFormData({
                    featureGating: {
                      ...formData.featureGating,
                      analyticsEnabled: value,
                    },
                  })
                }
                trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIcon, { backgroundColor: '#10B98115' }]}>
                <Bell size={20} color="#10B981" />
              </View>
              <Text style={styles.sectionTitle}>Notifications</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Configure notification settings for all users
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <View style={styles.switchLabelRow}>
                  <Mail size={18} color={Colors.text.primary} />
                  <Text style={styles.switchLabel}>Email Notifications</Text>
                </View>
                <Text style={styles.switchDescription}>
                  Send important updates via email
                </Text>
              </View>
              <Switch
                value={formData.notifications.emailNotifications}
                onValueChange={(value) =>
                  updateFormData({
                    notifications: {
                      ...formData.notifications,
                      emailNotifications: value,
                    },
                  })
                }
                trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.switchGroup}>
              <View style={styles.switchInfo}>
                <View style={styles.switchLabelRow}>
                  <Smartphone size={18} color={Colors.text.primary} />
                  <Text style={styles.switchLabel}>Push Notifications</Text>
                </View>
                <Text style={styles.switchDescription}>
                  Send real-time alerts via push notifications
                </Text>
              </View>
              <Switch
                value={formData.notifications.pushNotifications}
                onValueChange={(value) =>
                  updateFormData({
                    notifications: {
                      ...formData.notifications,
                      pushNotifications: value,
                    },
                  })
                }
                trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIcon, { backgroundColor: '#F59E0B15' }]}>
                <Shield size={20} color="#F59E0B" />
              </View>
              <Text style={styles.sectionTitle}>System Information</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>
                {Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {hasChanges && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarContent}>
            <View>
              <Text style={styles.bottomBarTitle}>Unsaved Changes</Text>
              <Text style={styles.bottomBarText}>You have modified settings</Text>
            </View>
            <View style={styles.bottomBarActions}>
              <TouchableOpacity
                style={styles.discardButton}
                onPress={() => {
                  setFormData(settings);
                  setHasChanges(false);
                }}
              >
                <Text style={styles.discardButtonText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButtonBottom} onPress={handleSave}>
                <Save size={18} color={Colors.white} />
                <Text style={styles.saveButtonBottomText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  saveButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 8,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
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
  inputHelp: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginTop: 6,
  },
  savingsInfo: {
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 10,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  savingsValue: {
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  switchGroup: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 4,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  switchDescription: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  bottomBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomBarContent: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  bottomBarTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  bottomBarText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  bottomBarActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  discardButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
  },
  discardButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  saveButtonBottom: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  saveButtonBottomText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
