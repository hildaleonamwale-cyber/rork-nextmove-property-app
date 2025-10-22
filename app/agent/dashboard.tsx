import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
  Home,
  Edit,
  Plus,
  Crown,
  Users,
  BarChart3,
  CheckCircle2,
  Lock,
  Building2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAgent } from '@/contexts/AgentContext';
import { useUserMode } from '@/contexts/UserModeContext';
import { supabase } from '@/lib/supabase';

export default function AgentDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, hasFeature, upgradePackage } = useAgent();
  const { switchMode } = useUserMode();
  const [properties, setProperties] = React.useState<any[]>([]);
  const [analytics, setAnalytics] = React.useState<any>(null);

  const fetchProperties = React.useCallback(async () => {
    if (!profile?.userId) return;

    console.log('Fetching properties for user:', profile.userId);
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', profile.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      console.log('Fetched properties count:', data?.length || 0);
      setProperties(data || []);
    }
  }, [profile?.userId]);

  const fetchAnalytics = React.useCallback(async () => {
    if (!profile?.userId) return;

    const { data: propertiesData } = await supabase
      .from('properties')
      .select('views, inquiries')
      .eq('user_id', profile.userId);

    const totalViews = propertiesData?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
    const totalInquiries = propertiesData?.reduce((sum, p) => sum + (p.inquiries || 0), 0) || 0;

    setAnalytics({
      views: {
        thisMonth: totalViews,
        total: totalViews,
        trend: 12,
      },
      bookings: {
        thisMonth: 0,
        total: 0,
        trend: 0,
      },
      inquiries: {
        thisMonth: totalInquiries,
        total: totalInquiries,
        trend: 15,
      },
    });
  }, [profile?.userId]);

  React.useEffect(() => {
    if (profile?.userId) {
      fetchAnalytics();
      fetchProperties();

      const subscription = supabase
        .channel(`agent_properties_${profile.userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'properties',
            filter: `user_id=eq.${profile.userId}`,
          },
          (payload) => {
            console.log('Agent properties changed:', payload.eventType);
            fetchProperties();
            fetchAnalytics();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [profile?.userId, fetchProperties, fetchAnalytics]);

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emptyStateText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const getPackageColor = () => {
    switch (profile.package) {
      case 'free': return '#10B981';
      case 'pro': return Colors.primary;
      case 'agency': return '#0019ff';
      default: return Colors.primary;
    }
  };

  const getPackageIcon = () => {
    switch (profile.package) {
      case 'agency': return <Users size={20} color={Colors.white} />;
      case 'pro': return <Crown size={20} color={Colors.white} />;
      default: return <CheckCircle2 size={20} color={Colors.white} />;
    }
  };

  const getUpgradePrompt = () => {
    if (profile.package === 'free') {
      return {
        title: 'Upgrade to Pro',
        description: 'Unlock booking calendar, messaging, verified badge, and full analytics',
        color: Colors.primary,
        targetPackage: 'pro' as const,
      };
    } else if (profile.package === 'pro') {
      return {
        title: 'Upgrade to Agency',
        description: 'Get staff accounts, shared dashboard, portfolio page, and 3D tours',
        color: '#0019ff',
        targetPackage: 'agency' as const,
      };
    }
    return null;
  };

  const handleUpgrade = async () => {
    if (upgradePrompt) {
      await upgradePackage(upgradePrompt.targetPackage);
    }
  };

  const upgradePrompt = getUpgradePrompt();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            switchMode('client');
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/home' as any);
            }
          }}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agent Dashboard</Text>
        <Image 
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ifbay395j090acyodisqd' }} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.packageBadge}>
          <View style={[styles.packageIcon, { backgroundColor: getPackageColor() }]}>
            {getPackageIcon()}
          </View>
          <View style={styles.packageInfo}>
            <Text style={styles.packageLabel}>Current Package</Text>
            <Text style={styles.packageName}>{profile.package.toUpperCase()}</Text>
          </View>
        </View>

        {upgradePrompt && (
          <TouchableOpacity 
            style={[styles.upgradeCard, { borderColor: upgradePrompt.color }]}
            onPress={handleUpgrade}
          >
            <Crown size={24} color={upgradePrompt.color} />
            <View style={styles.upgradeContent}>
              <Text style={[styles.upgradeTitle, { color: upgradePrompt.color }]}>
                {upgradePrompt.title}
              </Text>
              <Text style={styles.upgradeDescription}>{upgradePrompt.description}</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Eye size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{analytics?.views.thisMonth || 0}</Text>
            <Text style={styles.statLabel}>Profile Views</Text>
            <View style={styles.trendContainer}>
              <TrendingUp size={14} color='#10B981' />
              <Text style={styles.trendText}>+{analytics?.views.trend || 0}%</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <MessageSquare size={24} color={Colors.accent} />
            <Text style={styles.statValue}>{analytics?.inquiries.thisMonth || 0}</Text>
            <Text style={styles.statLabel}>Inquiries</Text>
            <View style={styles.trendContainer}>
              <TrendingUp size={14} color='#10B981' />
              <Text style={styles.trendText}>+{analytics?.inquiries.trend || 0}%</Text>
            </View>
          </View>
        </View>

        {hasFeature('full_analytics') ? (
          <View style={styles.fullAnalyticsCard}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Full Analytics</Text>
            </View>
            <View style={styles.analyticsRow}>
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics?.bookings.total || 0}</Text>
                <Text style={styles.analyticsLabel}>Total Bookings</Text>
              </View>
              <View style={styles.analyticsDivider} />
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics?.views.total || 0}</Text>
                <Text style={styles.analyticsLabel}>Total Views</Text>
              </View>
              <View style={styles.analyticsDivider} />
              <View style={styles.analyticsItem}>
                <Text style={styles.analyticsValue}>{analytics?.inquiries.total || 0}</Text>
                <Text style={styles.analyticsLabel}>Total Inquiries</Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.lockedFeatureCard}>
            <Lock size={24} color={Colors.text.light} />
            <Text style={styles.lockedFeatureTitle}>Full Analytics</Text>
            <Text style={styles.lockedFeatureText}>Upgrade to Pro to access detailed analytics</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/agent/add-property' as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: `${Colors.primary}15` }]}>
            <Plus size={24} color={Colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Add New Property</Text>
            <Text style={styles.actionDescription}>List a property for sale or rent</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/agent/edit-profile' as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: `${Colors.accent}15` }]}>
            <Edit size={24} color={Colors.accent} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Edit Profile</Text>
            <Text style={styles.actionDescription}>Update your info, banner, and portfolio</Text>
          </View>
        </TouchableOpacity>

        {hasFeature('booking_calendar') ? (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/agent/calendar' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B15' }]}>
              <Calendar size={24} color='#F59E0B' />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Calendar</Text>
              <Text style={styles.actionDescription}>Set available booking slots</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.lockedActionCard}>
            <View style={styles.lockedActionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.gray[100] }]}>
                <Calendar size={24} color={Colors.text.light} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.lockedActionTitle}>Booking Calendar</Text>
                <Text style={styles.actionDescription}>Upgrade to Pro to unlock</Text>
              </View>
            </View>
            <Lock size={20} color={Colors.text.light} />
          </TouchableOpacity>
        )}

        {hasFeature('staff_accounts') ? (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/agent/staff' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#0019ff15' }]}>
              <Users size={24} color='#0019ff' />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Staff</Text>
              <Text style={styles.actionDescription}>Add and manage team members</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.lockedActionCard}>
            <View style={styles.lockedActionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.gray[100] }]}>
                <Users size={24} color={Colors.text.light} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.lockedActionTitle}>Staff Accounts</Text>
                <Text style={styles.actionDescription}>Upgrade to Agency to unlock</Text>
              </View>
            </View>
            <Lock size={20} color={Colors.text.light} />
          </TouchableOpacity>
        )}

        {hasFeature('property_management') ? (
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/agent/property-management' as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B98115' }]}>
              <Building2 size={24} color='#10B981' />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Properties</Text>
              <Text style={styles.actionDescription}>Track and manage all properties</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.lockedActionCard}>
            <View style={styles.lockedActionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.gray[100] }]}>
                <Building2 size={24} color={Colors.text.light} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.lockedActionTitle}>Property Management</Text>
                <Text style={styles.actionDescription}>Upgrade to Agency to unlock</Text>
              </View>
            </View>
            <Lock size={20} color={Colors.text.light} />
          </TouchableOpacity>
        )}

        <View style={styles.propertiesSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <Home size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>My Properties</Text>
            </View>
            <Text style={styles.propertyCount}>{properties.length}</Text>
          </View>

          {properties.length === 0 ? (
            <View style={styles.emptyState}>
              <Home size={48} color={Colors.text.light} />
              <Text style={styles.emptyStateText}>No properties listed yet</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/agent/add-property' as any)}
              >
                <Text style={styles.emptyStateButtonText}>Add Your First Property</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.propertyList}>
              {properties.slice(0, 3).map((property: any) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.propertyItem}
                  onPress={() => router.push(`/property/${property.id}` as any)}
                >
                  <Home size={20} color={Colors.primary} />
                  <View style={styles.propertyInfo}>
                    <Text style={styles.propertyTitle}>{property.title || 'Untitled'}</Text>
                    <Text style={styles.propertyMeta}>
                      {property.bedrooms} bed • {property.bathrooms} bath • {property.area} sqm
                    </Text>
                  </View>
                  <Text style={styles.propertyPrice}>${property.price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  logo: {
    width: 32,
    height: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  packageBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
  },
  packageInfo: {
    flex: 1,
  },
  packageLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
    fontWeight: '600' as const,
  },
  packageName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  upgradeCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    gap: 16,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  upgradeDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center' as const,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  trendContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  fullAnalyticsCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
  analyticsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  analyticsItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  analyticsDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray[200],
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  lockedFeatureCard: {
    backgroundColor: Colors.white,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderStyle: 'dashed' as const,
  },
  lockedFeatureTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    marginTop: 12,
    marginBottom: 6,
  },
  lockedFeatureText: {
    fontSize: 14,
    color: Colors.text.light,
    textAlign: 'center' as const,
  },
  actionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  lockedActionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderStyle: 'dashed' as const,
  },
  lockedActionLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  lockedActionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  propertiesSection: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
  },
  propertyCount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
  },
  emptyState: {
    backgroundColor: Colors.white,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center' as const,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
    marginBottom: 20,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  propertyList: {
    gap: 12,
  },
  propertyItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    gap: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  propertyMeta: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
