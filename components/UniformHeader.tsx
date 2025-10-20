import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';

interface UniformHeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
  subtitle?: string;
  showBorder?: boolean;
}

export default function UniformHeader({ 
  title, 
  rightComponent, 
  subtitle,
  showBorder = true 
}: UniformHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.header, 
        { 
          paddingTop: Platform.OS === 'web' ? 20 : insets.top + 20,
          borderBottomWidth: showBorder ? 1 : 0,
        }
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.rightSection}>
          {rightComponent && (
            <View style={styles.rightComponent}>
              {rightComponent}
            </View>
          )}
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ifbay395j090acyodisqd' }} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: DesignSystem.contentPadding,
    paddingBottom: 20,
    borderBottomColor: Colors.gray[100],
  },
  headerContent: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  rightSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  rightComponent: {
    marginRight: 0,
  },
  logo: {
    width: 32,
    height: 32,
  },
});
