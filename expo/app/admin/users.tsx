import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, ShieldOff, Trash2, TrendingUp, Search, X } from 'lucide-react-native';
import { useSupabaseUsers } from '@/hooks/useSupabaseAdmin';
import Colors from '@/constants/colors';

export default function UserManagement() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { users, isLoading, blockUser, unblockUser, updateUserRole } = useSupabaseUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | string>('all');
  const [selectedTier, setSelectedTier] = useState<'all' | string>('all');
  const [showBlocked, setShowBlocked] = useState<'all' | 'blocked' | 'active'>('all');

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !user.name.toLowerCase().includes(query) &&
          !user.email.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (selectedRole !== 'all' && user.role !== selectedRole) {
        return false;
      }

      if (selectedTier !== 'all' && user.accountTier !== selectedTier) {
        return false;
      }

      if (showBlocked === 'blocked' && !user.blocked) {
        return false;
      }

      if (showBlocked === 'active' && user.blocked) {
        return false;
      }

      return true;
    });
  }, [users, searchQuery, selectedRole, selectedTier, showBlocked]);

  const handleBlock = (userId: string, isBlocked: boolean) => {
    Alert.alert(
      isBlocked ? 'Unblock User' : 'Block User',
      `Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isBlocked ? 'Unblock' : 'Block',
          style: isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              if (isBlocked) {
                await unblockUser(userId);
              } else {
                await blockUser(userId);
              }
            } catch (error) {
              Alert.alert('Error', `Failed to ${isBlocked ? 'unblock' : 'block'} user`);
              console.error('Failed to block/unblock user:', error);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This feature is not available yet.`,
      [
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handleUpgrade = (userId: string, currentRole: string) => {
    const roles = ['client', 'agent', 'agency', 'super_admin'];
    const options = roles.map((role) => ({
      text: `${role} ${currentRole === role ? '(current)' : ''}`,
      onPress: async () => {
        try {
          await updateUserRole(userId, role);
        } catch (error) {
          Alert.alert('Error', 'Failed to update user role');
          console.error('Failed to update user role:', error);
        }
      },
    }));
    options.push({ text: 'Cancel', onPress: async () => {} });
    Alert.alert('Change User Role', 'Select new role:', options);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '#EF4444';
      case 'agency':
        return '#8B5CF6';
      case 'agent':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'agency':
        return '#F59E0B';
      case 'pro':
        return Colors.primary;
      default:
        return Colors.gray[400];
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 60 : insets.top + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>
            {filteredUsers.length} of {users.length} users
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.secondary}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Role:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['all', 'client', 'agent', 'agency', 'super_admin'].map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.filterChip, selectedRole === role && styles.filterChipActive]}
                onPress={() => setSelectedRole(role)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedRole === role && styles.filterChipTextActive,
                  ]}
                >
                  {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Tier:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['all', 'free', 'pro', 'agency'].map((tier) => (
              <TouchableOpacity
                key={tier}
                style={[styles.filterChip, selectedTier === tier && styles.filterChipActive]}
                onPress={() => setSelectedTier(tier)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedTier === tier && styles.filterChipTextActive,
                  ]}
                >
                  {tier === 'all' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['all', 'active', 'blocked'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterChip, showBlocked === status && styles.filterChipActive]}
                onPress={() => setShowBlocked(status as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    showBlocked === status && styles.filterChipTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : (
        <View style={styles.section}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Search size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.badges}>
                      <View style={[styles.badge, { backgroundColor: `${getRoleBadgeColor(user.role)}20` }]}>
                        <Text style={[styles.badgeText, { color: getRoleBadgeColor(user.role) }]}>
                          {user.role}
                        </Text>
                      </View>
                      {user.accountTier && (
                        <View style={[styles.badge, { backgroundColor: `${getTierBadgeColor(user.accountTier)}20` }]}>
                          <Text style={[styles.badgeText, { color: getTierBadgeColor(user.accountTier) }]}>
                            {user.accountTier}
                          </Text>
                        </View>
                      )}
                      {user.blocked && (
                        <View style={[styles.badge, { backgroundColor: '#EF444420' }]}>
                          <Text style={[styles.badgeText, { color: '#EF4444' }]}>Blocked</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.userStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{user.propertiesCount || 0}</Text>
                  <Text style={styles.statLabel}>Properties</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{user.bookingsCount || 0}</Text>
                  <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{new Date(user.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.statLabel}>Joined</Text>
                </View>
              </View>

              <View style={styles.userActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnPrimary]}
                  onPress={() => handleUpgrade(user.id, user.role)}
                >
                  <TrendingUp size={18} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, user.blocked ? styles.actionBtnSuccess : styles.actionBtnWarning]}
                  onPress={() => handleBlock(user.id, user.blocked)}
                >
                  {user.blocked ? (
                    <Shield size={18} color={Colors.white} />
                  ) : (
                    <ShieldOff size={18} color={Colors.white} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnDanger]}
                  onPress={() => handleDelete(user.id, user.name)}
                >
                  <Trash2 size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          ))
          )}
        </View>
        )}

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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  userCard: {
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
  userHeader: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  userStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray[100],
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  userActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 12,
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
  actionBtnWarning: {
    backgroundColor: '#F59E0B',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    height: '100%' as const,
    outlineStyle: 'none' as const,
  },
  filtersContainer: {
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    width: 60,
  },
  filterScroll: {
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  filterChipTextActive: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
});
