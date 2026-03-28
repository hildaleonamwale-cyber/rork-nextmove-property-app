import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Eye, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#0019ff15' }]}>
                  <Eye size={20} color="#0019ff" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Profile Visibility</Text>
                  <Text style={styles.settingDescription}>Show profile to others</Text>
                </View>
              </View>
              <Switch
                value={profileVisible}
                onValueChange={setProfileVisible}
                trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#10B98115' }]}>
                  <Bell size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Activity Status</Text>
                  <Text style={styles.settingDescription}>Show when you&apos;re active</Text>
                </View>
              </View>
              <Switch
                value={activityStatus}
                onValueChange={setActivityStatus}
                trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/account/change-password')}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#EF444415' }]}>
                  <Lock size={20} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Change Password</Text>
                  <Text style={styles.settingDescription}>Update your password</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
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
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[100],
    marginLeft: 70,
  },
});
