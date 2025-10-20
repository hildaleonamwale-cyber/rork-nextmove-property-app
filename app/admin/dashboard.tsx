import React, { useState, useMemo } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Users,
  Home,
  Image as ImageIcon,
  Settings,
  Shield,
  Layout,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
} from 'lucide-react-native';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import Colors from '@/constants/colors';
import type { DashboardAnalytics } from '@/types/admin';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSuperAdmin } = useSuperAdmin();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const mockAnalytics: DashboardAnalytics = useMemo(() => ({
    overview: {
      totalUsers: 12847,
      totalAgents: 342,
      totalAgencies: 87,
      totalProperties: 4521,
      totalBookings: 8934,
      activeListings: 3842,
      flaggedContent: 23,
      blockedUsers: 15,
    },
    trends: {
      newUsersThisMonth: 487,
      newUsersLastMonth: 423,
      bookingsThisWeek: 234,
      bookingsLastWeek: 198,
      listingsThisMonth: 156,
      listingsLastMonth: 142,
    },
    usersByRole: {
      clients: 12418,
      agents: 342,
      agencies: 87,
    },
    usersByPackage: {
      free: 11923,
      pro: 837,
      agency: 87,
    },
    propertiesByType: {
      apartment: 2145,
      house: 1342,
      villa: 456,
      condo: 378,
      commercial: 200,
    },
    propertiesByStatus: {
      forRent: 2834,
      forSale: 1243,
      managed: 344,
      vacant: 67,
      occupied: 277,
    },
    recentActivity: [],
  }), []);

  if (!isSuperAdmin) {
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 60 : insets.top + 20 }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>You do not have super admin privileges</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const menuItems = [
    {
      id: 'banners',
      title: 'Homepage Banners',
      description: 'Manage Featured Agencies banners',
      icon: ImageIcon,
      color: Colors.primary,
      route: '/admin/banners',
    },
    {
      id: 'sections',
      title: 'Homepage Sections',
      description: 'Configure all homepage sections',
      icon: Layout,
      color: '#8B5CF6',
      route: '/admin/sections',
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'View, edit, block or upgrade users',
      icon: Users,
      color: '#10B981',
      route: '/admin/users',
    },
    {
      id: 'properties',
      title: 'Property Management',
      description: 'Manage all properties & listings',
      icon: Home,
      color: '#F59E0B',
      route: '/admin/properties',
    },
    {
      id: 'moderation',
      title: 'Content Moderation',
      description: 'Approve or remove user content',
      icon: Shield,
      color: '#EF4444',
      route: '/admin/moderation',
    },
    {
      id: 'settings',
      title: 'System Settings',
      description: 'Configure pricing & features',
      icon: Settings,
      color: '#6B7280',
      route: '/admin/settings',
    },
  ];

  const chartData = useMemo(() => {
    return [
      { label: 'Mon', users: 120, properties: 45, bookings: 32 },
      { label: 'Tue', users: 145, properties: 52, bookings: 38 },
      { label: 'Wed', users: 132, properties: 48, bookings: 35 },
      { label: 'Thu', users: 168, properties: 61, bookings: 42 },
      { label: 'Fri', users: 189, properties: 68, bookings: 48 },
      { label: 'Sat', users: 156, properties: 55, bookings: 40 },
      { label: 'Sun', users: 134, properties: 50, bookings: 36 },
    ];
  }, []);

  const pieChartData = useMemo(() => {
    const total = mockAnalytics.overview.totalProperties;
    return [
      { 
        value: mockAnalytics.propertiesByType.apartment, 
        percentage: (mockAnalytics.propertiesByType.apartment / total * 100).toFixed(1),
        color: '#3B82F6',
        label: 'Apartments'
      },
      { 
        value: mockAnalytics.propertiesByType.house, 
        percentage: (mockAnalytics.propertiesByType.house / total * 100).toFixed(1),
        color: '#10B981',
        label: 'Houses'
      },
      { 
        value: mockAnalytics.propertiesByType.villa, 
        percentage: (mockAnalytics.propertiesByType.villa / total * 100).toFixed(1),
        color: '#F59E0B',
        label: 'Villas'
      },
      { 
        value: mockAnalytics.propertiesByType.condo, 
        percentage: (mockAnalytics.propertiesByType.condo / total * 100).toFixed(1),
        color: '#8B5CF6',
        label: 'Condos'
      },
      { 
        value: mockAnalytics.propertiesByType.commercial, 
        percentage: (mockAnalytics.propertiesByType.commercial / total * 100).toFixed(1),
        color: '#EC4899',
        label: 'Commercial'
      },
    ];
  }, [mockAnalytics]);

  const maxChartValue = useMemo(() => {
    return Math.max(...chartData.map(d => Math.max(d.users, d.properties, d.bookings)));
  }, [chartData]);

  const stats = [
    { 
      label: 'Total Users', 
      value: mockAnalytics.overview.totalUsers.toLocaleString(), 
      color: '#3B82F6',
      trend: ((mockAnalytics.trends.newUsersThisMonth - mockAnalytics.trends.newUsersLastMonth) / mockAnalytics.trends.newUsersLastMonth * 100).toFixed(1),
      trendUp: mockAnalytics.trends.newUsersThisMonth > mockAnalytics.trends.newUsersLastMonth,
    },
    { 
      label: 'Active Listings', 
      value: mockAnalytics.overview.activeListings.toLocaleString(), 
      color: '#10B981',
      trend: ((mockAnalytics.trends.listingsThisMonth - mockAnalytics.trends.listingsLastMonth) / mockAnalytics.trends.listingsLastMonth * 100).toFixed(1),
      trendUp: mockAnalytics.trends.listingsThisMonth > mockAnalytics.trends.listingsLastMonth,
    },
    { 
      label: 'Total Properties', 
      value: mockAnalytics.overview.totalProperties.toLocaleString(), 
      color: '#8B5CF6',
      trend: '12.3',
      trendUp: true,
    },
    { 
      label: 'Bookings', 
      value: mockAnalytics.overview.totalBookings.toLocaleString(), 
      color: '#F59E0B',
      trend: ((mockAnalytics.trends.bookingsThisWeek - mockAnalytics.trends.bookingsLastWeek) / mockAnalytics.trends.bookingsLastWeek * 100).toFixed(1),
      trendUp: mockAnalytics.trends.bookingsThisWeek > mockAnalytics.trends.bookingsLastWeek,
    },
    { 
      label: 'Flagged Content', 
      value: mockAnalytics.overview.flaggedContent.toString(), 
      color: '#EF4444',
      trend: '-15.2',
      trendUp: false,
    },
    { 
      label: 'Agents', 
      value: mockAnalytics.overview.totalAgents.toString(), 
      color: '#EC4899',
      trend: '8.7',
      trendUp: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 60 : insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Super Admin</Text>
            <Text style={styles.headerSubtitle}>Full system access</Text>
          </View>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ifbay395j090acyodisqd' }} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Dashboard Overview</Text>
              <Text style={styles.sectionSubtitle}>Real-time platform metrics</Text>
            </View>
            <View style={styles.periodSelector}>
              {(['week', 'month', 'year'] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      selectedPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                <View style={styles.statHeader}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <View style={[styles.trendBadge, { backgroundColor: stat.trendUp ? '#DEF7EC' : '#FDE8E8' }]}>
                    {stat.trendUp ? (
                      <TrendingUp size={12} color="#0E9F6E" strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={12} color="#F05252" strokeWidth={2.5} />
                    )}
                    <Text style={[styles.trendText, { color: stat.trendUp ? '#0E9F6E' : '#F05252' }]}>
                      {stat.trend}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Activity size={20} color={Colors.primary} />
            <Text style={styles.chartTitle}>Activity Trends</Text>
          </View>
          <View style={styles.chartCard}>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Users</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Properties</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Bookings</Text>
              </View>
            </View>
            <View style={styles.chart}>
              {chartData.map((data, index) => (
                <View key={data.label} style={styles.chartColumn}>
                  <View style={styles.chartBars}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${(data.users / maxChartValue) * 100}%`,
                          backgroundColor: '#3B82F6',
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${(data.properties / maxChartValue) * 100}%`,
                          backgroundColor: '#10B981',
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: `${(data.bookings / maxChartValue) * 100}%`,
                          backgroundColor: '#F59E0B',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{data.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <DollarSign size={20} color={Colors.primary} />
            <Text style={styles.chartTitle}>Property Distribution</Text>
          </View>
          <View style={styles.chartCard}>
            <View style={styles.pieChartContainer}>
              <View style={styles.pieChart}>
                {pieChartData.map((item, index) => {
                  const startAngle = pieChartData.slice(0, index).reduce((acc, curr) => {
                    return acc + (parseFloat(curr.percentage) / 100) * 360;
                  }, 0);
                  return (
                    <View
                      key={item.label}
                      style={[
                        styles.pieSlice,
                        {
                          backgroundColor: item.color,
                          transform: [
                            { rotate: `${startAngle}deg` },
                          ],
                        },
                      ]}
                    />
                  );
                })}
                <View style={styles.pieChartCenter}>
                  <Text style={styles.pieChartCenterText}>Total</Text>
                  <Text style={styles.pieChartCenterValue}>{mockAnalytics.overview.totalProperties}</Text>
                </View>
              </View>
              <View style={styles.pieChartLegend}>
                {pieChartData.map((item) => (
                  <View key={item.label} style={styles.pieChartLegendItem}>
                    <View style={[styles.pieChartLegendDot, { backgroundColor: item.color }]} />
                    <View style={styles.pieChartLegendInfo}>
                      <Text style={styles.pieChartLegendLabel}>{item.label}</Text>
                      <View style={styles.pieChartLegendValues}>
                        <Text style={styles.pieChartLegendValue}>{item.value.toLocaleString()}</Text>
                        <Text style={styles.pieChartLegendPercentage}>{item.percentage}%</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribution</Text>
          <View style={styles.distributionGrid}>
            <View style={styles.distributionCard}>
              <Text style={styles.distributionTitle}>Users by Role</Text>
              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionBarFill, { width: `${(mockAnalytics.usersByRole.clients / mockAnalytics.overview.totalUsers) * 100}%`, backgroundColor: '#3B82F6' }]} />
                </View>
                <View style={styles.distributionLabel}>
                  <Text style={styles.distributionLabelText}>Clients</Text>
                  <Text style={styles.distributionValue}>{mockAnalytics.usersByRole.clients.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionBarFill, { width: `${(mockAnalytics.usersByRole.agents / mockAnalytics.overview.totalUsers) * 100}%`, backgroundColor: '#10B981' }]} />
                </View>
                <View style={styles.distributionLabel}>
                  <Text style={styles.distributionLabelText}>Agents</Text>
                  <Text style={styles.distributionValue}>{mockAnalytics.usersByRole.agents.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionBarFill, { width: `${(mockAnalytics.usersByRole.agencies / mockAnalytics.overview.totalUsers) * 100}%`, backgroundColor: '#8B5CF6' }]} />
                </View>
                <View style={styles.distributionLabel}>
                  <Text style={styles.distributionLabelText}>Agencies</Text>
                  <Text style={styles.distributionValue}>{mockAnalytics.usersByRole.agencies.toLocaleString()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.distributionCard}>
              <Text style={styles.distributionTitle}>Properties by Type</Text>
              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionBarFill, { width: `${(mockAnalytics.propertiesByType.apartment / mockAnalytics.overview.totalProperties) * 100}%`, backgroundColor: '#F59E0B' }]} />
                </View>
                <View style={styles.distributionLabel}>
                  <Text style={styles.distributionLabelText}>Apartments</Text>
                  <Text style={styles.distributionValue}>{mockAnalytics.propertiesByType.apartment.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionBarFill, { width: `${(mockAnalytics.propertiesByType.house / mockAnalytics.overview.totalProperties) * 100}%`, backgroundColor: '#EC4899' }]} />
                </View>
                <View style={styles.distributionLabel}>
                  <Text style={styles.distributionLabelText}>Houses</Text>
                  <Text style={styles.distributionValue}>{mockAnalytics.propertiesByType.house.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionBarFill, { width: `${(mockAnalytics.propertiesByType.villa / mockAnalytics.overview.totalProperties) * 100}%`, backgroundColor: '#06B6D4' }]} />
                </View>
                <View style={styles.distributionLabel}>
                  <Text style={styles.distributionLabelText}>Villas</Text>
                  <Text style={styles.distributionValue}>{mockAnalytics.propertiesByType.villa.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View style={[styles.distributionBarFill, { width: `${(mockAnalytics.propertiesByType.condo / mockAnalytics.overview.totalProperties) * 100}%`, backgroundColor: '#84CC16' }]} />
                </View>
                <View style={styles.distributionLabel}>
                  <Text style={styles.distributionLabelText}>Condos</Text>
                  <Text style={styles.distributionValue}>{mockAnalytics.propertiesByType.condo.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuCard}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                  <item.icon size={28} color={item.color} strokeWidth={2} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  headerTextContainer: {
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 16,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  periodSelector: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.text.primary,
    fontWeight: '600' as const,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 150 : 95,
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 3,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  trendBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  distributionGrid: {
    gap: 16,
  },
  distributionCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  distributionItem: {
    marginBottom: 12,
  },
  distributionBar: {
    height: 8,
    backgroundColor: Colors.gray[100],
    borderRadius: 4,
    overflow: 'hidden' as const,
    marginBottom: 6,
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  distributionLabel: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  distributionLabelText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  distributionValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  menuGrid: {
    gap: 12,
  },
  menuCard: {
    backgroundColor: Colors.white,
    padding: 18,
    borderRadius: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 6,
  },
  menuDescription: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  chartHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  chartCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  chartLegend: {
    flexDirection: 'row' as const,
    gap: 16,
    marginBottom: 20,
    flexWrap: 'wrap' as const,
  },
  legendItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  chart: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'space-between' as const,
    height: 180,
    gap: 4,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center' as const,
    gap: 8,
  },
  chartBars: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'center' as const,
    gap: 2,
    height: 160,
    width: '100%' as const,
  },
  chartBar: {
    flex: 1,
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  pieChartContainer: {
    gap: 24,
  },
  pieChart: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignSelf: 'center' as const,
    position: 'relative' as const,
    backgroundColor: Colors.gray[100],
    overflow: 'hidden' as const,
  },
  pieSlice: {
    position: 'absolute' as const,
    width: '50%' as const,
    height: '50%' as const,
    top: 0,
    left: '50%' as const,
    transformOrigin: '0% 100%' as const,
  },
  pieChartCenter: {
    position: 'absolute' as const,
    top: '50%' as const,
    left: '50%' as const,
    transform: [{ translateX: -50 }, { translateY: -50 }],
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pieChartCenterText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase' as const,
  },
  pieChartCenterValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.primary,
  },
  pieChartLegend: {
    gap: 12,
  },
  pieChartLegendItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  pieChartLegendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pieChartLegendInfo: {
    flex: 1,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  pieChartLegendLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  pieChartLegendValues: {
    flexDirection: 'row' as const,
    gap: 12,
    alignItems: 'center' as const,
  },
  pieChartLegendValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  pieChartLegendPercentage: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
});
