import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal } from 'react-native';
import {
  X,
  Home,
  PlusCircle,
  Calendar,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Briefcase,
  Heart,
  MessageCircle,
  Bell,
  User,
  Shield,
  HelpCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  userMode: 'viewer' | 'agent' | 'agency';
}

export default function SideMenu({ visible, onClose, onNavigate, userMode }: SideMenuProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const viewerItems = [
    { id: 'home', icon: Home, label: 'Home', color: Colors.primary },
    { id: 'saved', icon: Heart, label: 'Saved Properties', color: '#EF4444' },
    { id: 'bookings', icon: Calendar, label: 'My Bookings', color: '#0019ff' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', color: '#06B6D4' },
    { id: 'notifications', icon: Bell, label: 'Notifications', color: '#F59E0B' },
  ];

  const agentItems = [
    { id: 'list-property', icon: PlusCircle, label: 'List Property', color: Colors.primary },
    { id: 'manage-bookings', icon: Calendar, label: 'Manage Bookings', color: '#0019ff' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics Dashboard', color: '#10B981' },
    { id: 'portfolio', icon: Briefcase, label: 'My Portfolio', color: '#F59E0B' },
  ];

  const agencyItems = [
    { id: 'staff', icon: Users, label: 'Staff Management', color: '#3B82F6' },
    { id: 'analytics', icon: BarChart3, label: 'Agency Analytics', color: '#10B981' },
  ];

  const generalItems = [
    { id: 'profile', icon: User, label: 'My Profile', color: Colors.text.primary },
    { id: 'settings', icon: Settings, label: 'Settings', color: Colors.text.primary },
    { id: 'privacy', icon: Shield, label: 'Privacy & Security', color: Colors.text.primary },
    { id: 'help', icon: HelpCircle, label: 'Help & Support', color: Colors.text.primary },
  ];

  const menuSections = [
    { title: userMode === 'viewer' ? 'Quick Access' : 'Dashboard', items: userMode === 'viewer' ? viewerItems : [...agentItems, ...(userMode === 'agency' ? agencyItems : [])] },
    { title: 'Account', items: generalItems },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <View style={[styles.menu, { paddingTop: Platform.OS === 'web' ? 40 : insets.top + 20 }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, userMode === 'viewer' && styles.modeButtonActive]}
            onPress={() => {}}
          >
            <Text style={[styles.modeText, userMode === 'viewer' && styles.modeTextActive]}>
              Viewer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, userMode === 'agent' && styles.modeButtonActive]}
            onPress={() => {}}
          >
            <Text style={[styles.modeText, userMode === 'agent' && styles.modeTextActive]}>
              Agent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, userMode === 'agency' && styles.modeButtonActive]}
            onPress={() => {}}
          >
            <Text style={[styles.modeText, userMode === 'agency' && styles.modeTextActive]}>
              Agency
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
          {menuSections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuItemIcon, { backgroundColor: `${item.color}15` }]}>
                    <item.icon size={22} color={item.color} />
                  </View>
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
              {sectionIndex < menuSections.length - 1 && <View style={styles.sectionDivider} />}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.logoutButton} onPress={() => {}}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menu: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  closeButton: {
    padding: 4,
  },
  modeSelector: {
    flexDirection: 'row' as const,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    padding: 4,
    gap: 6,
    backgroundColor: Colors.gray[100],
    borderRadius: 14,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
    alignItems: 'center' as const,
  },
  modeButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  modeTextActive: {
    color: Colors.primary,
  },
  menuList: {
    flex: 1,
    paddingTop: 12,
  },
  menuSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 12,
    marginHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.error,
  },
});
