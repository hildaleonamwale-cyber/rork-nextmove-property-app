import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Phone, Mail } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Agency } from '@/types/property';

interface AgencyCardProps {
  agency: Agency & { companyName?: string };
  onPress: () => void;
  isPrivateLister?: boolean;
}

export default function AgencyCard({ agency, onPress, isPrivateLister = false }: AgencyCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.leftSection}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: agency.logo }} style={styles.image} />
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.name} numberOfLines={1}>
            {agency.name}
          </Text>
          <Text style={styles.companyName} numberOfLines={1}>
            {isPrivateLister ? 'Private Lister' : agency.description || 'Real Estate Company'}
          </Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <Phone size={20} color={Colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSecondary}>
          <Mail size={20} color={Colors.text.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginHorizontal: 0,
  },
  leftSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
    flex: 1,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden' as const,
    backgroundColor: Colors.gray[100],
  },
  image: {
    width: '100%' as const,
    height: '100%' as const,
  },
  infoSection: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
  },
  actionsSection: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  actionButtonSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
