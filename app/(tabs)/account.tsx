import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Briefcase,
  Crown,
  Edit,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';
import { useUserMode } from '@/contexts/UserModeContext';
import { useUser } from '@/contexts/UserContext';
import OptimizedImage from '@/components/OptimizedImage';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import UniformHeader from '@/components/UniformHeader';
import { useAgentProfile } from '@/contexts/AgentProfileContext';
import LoginPrompt from '@/components/LoginPrompt';

export default function AccountScreen() {
  const router = useRouter();
  const { isClient, isAgent, switchMode } = useUserMode();
  const { isSuperAdmin, enableSuperAdmin } = useSuperAdmin();
  const { user, isLoading } = useUser();
  const { profile: agentProfile, isLoading: agentLoading } = useAgentProfile();

  const clientMenuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', color: Colors.primary, route: '/account/personal-info' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Shield, label: 'Privacy & Security', color: '#4FD2C5', route: '/account/privacy' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', color: '#06B6D4', route: '/account/help' },
        { icon: FileText, label: 'Terms & Conditions', color: Colors.text.secondary, route: '/account/terms' },
      ],
    },
  ];

  const agentMenuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', color: Colors.primary, route: '/account/personal-info' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: Shield, label: 'Privacy & Security', color: '#4FD2C5', route: '/account/privacy' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', color: '#06B6D4', route: '/account/help' },
        { icon: FileText, label: 'Terms & Conditions', color: Colors.text.secondary, route: '/account/terms' },
      ],
    },
  ];

  const menuSections = isClient ? clientMenuSections : agentMenuSections;

  if (!user && !isLoading) {
    return (
      <View style={styles.container}>
        <UniformHeader title="Account" showBorder={false} />
        <LoginPrompt 
          message="Please log in to access your account and manage your settings"
          icon={User}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UniformHeader title="Account" showBorder={false} />
      
      <View style={styles.headerSection}>
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[styles.modeButton, isClient && styles.modeButtonActive]}
            onPress={() => switchMode('client')}
          >
            <User size={18} color={isClient ? Colors.white : Colors.text.secondary} />
            <Text style={[styles.modeButtonText, isClient && styles.modeButtonTextActive]}>
              Client Mode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, isAgent && styles.modeButtonActive]}
            onPress={() => {
              const hasAgentProfile = agentProfile?.accountSetupComplete;
              console.log('Agent mode clicked - hasAgentProfile:', hasAgentProfile);
              console.log('Agent profile:', agentProfile);
              
              if (!isAgent) {
                switchMode('agent');
                if (hasAgentProfile) {
                  setTimeout(() => router.push('/agent/dashboard' as any), 100);
                } else {
                  setTimeout(() => router.push('/agent/onboarding' as any), 100);
                }
              } else {
                setTimeout(() => router.push('/agent/dashboard' as any), 100);
              }
            }}
          >
            <Briefcase size={18} color={isAgent ? Colors.white : Colors.text.secondary} />
            <Text style={[styles.modeButtonText, isAgent && styles.modeButtonTextActive]}>
              Agent Mode
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileCard}>
          {isClient ? (
            user?.avatar ? (
              <OptimizedImage 
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatar}>
                <User size={32} color={Colors.white} />
              </View>
            )
          ) : (
            user?.avatar ? (
              <OptimizedImage 
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatar}>
                <Briefcase size={32} color={Colors.white} />
              </View>
            )
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {isLoading || agentLoading ? 'Loading...' : (
                isAgent && agentProfile?.companyName ? agentProfile.companyName : (user?.name || 'Guest User')
              )}
            </Text>
            <Text style={styles.profileEmail}>
              {isLoading || agentLoading ? 'Loading...' : (user?.email || 'No email')}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => {
              if (isAgent) {
                router.push('/agent/edit-profile' as any);
              } else {
                router.push('/account/personal-info' as any);
              }
            }}
          >
            <Edit size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {menuSections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push(item.route as any)}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                      <item.icon size={20} color={item.color} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <ChevronRight size={20} color={Colors.text.light} />
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {isSuperAdmin && (
          <TouchableOpacity 
            style={styles.superAdminButton}
            onPress={() => router.push('/admin/dashboard' as any)}
          >
            <Crown size={20} color="#F59E0B" />
            <Text style={styles.superAdminText}>Super Admin Dashboard</Text>
            <ChevronRight size={20} color="#F59E0B" />
          </TouchableOpacity>
        )}

        {!isSuperAdmin && (
          <TouchableOpacity 
            style={styles.devButton}
            onPress={async () => {
              await enableSuperAdmin();
              alert('Super Admin mode enabled! Refresh to see the dashboard.');
            }}
          >
            <Shield size={18} color={Colors.text.secondary} />
            <Text style={styles.devButtonText}>Enable Super Admin (Dev)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.clear();
            router.replace('/login' as any);
          }}
        >
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: DesignSystem.contentPadding,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  profileCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    flex: 1,
    padding: DesignSystem.contentPadding,
    backgroundColor: '#FFFFFF',
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
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.card.borderRadius,
    overflow: 'hidden' as const,
    ...DesignSystem.card.shadow,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.md,
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[100],
    marginLeft: 70,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.card.borderRadius,
    marginTop: DesignSystem.spacing.md,
    ...DesignSystem.card.shadow,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.error,
  },
  superAdminButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  superAdminText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  devButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    marginTop: 12,
  },
  devButtonText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  modeToggleContainer: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    gap: 6,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'transparent' as const,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  modeButtonTextActive: {
    color: Colors.white,
  },
});
