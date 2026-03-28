import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: any;
}

export default function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  actionText = 'See all',
  onActionPress,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftContent}>
        {Icon && (
          <View style={styles.iconContainer}>
            <Icon size={22} color={Colors.primary} strokeWidth={2.5} />
          </View>
        )}
        <View style={styles.textContent}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {onActionPress && (
        <TouchableOpacity onPress={onActionPress} style={styles.actionButton}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    paddingVertical: 4,
    marginBottom: 20,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  textContent: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: `${Colors.primary}10`,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
