import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Menu, Bell, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserMode } from '@/contexts/UserModeContext';
import Colors from '@/constants/colors';

interface CurvedHeaderProps {
  onMenuPress: () => void;
  title?: string;
}

export default function CurvedHeader({ onMenuPress, title = 'NextMove' }: CurvedHeaderProps) {
  const insets = useSafeAreaInsets();
  const { isClient } = useUserMode();
  const userName = isClient ? 'Client' : 'Agent';

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <Menu size={24} color={Colors.text.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.centerSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconCircle}>
              <Search size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconCircle}>
              <Bell size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
  },
  leftSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  menuButton: {
    padding: 8,
  },
  centerSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  rightSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  iconButton: {
    padding: 4,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(189, 170, 153, 0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
