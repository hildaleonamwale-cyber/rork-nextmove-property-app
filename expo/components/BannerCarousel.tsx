import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

import { ArrowUpRight } from 'lucide-react-native';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import Colors from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function BannerCarousel() {
  const { banners } = useSuperAdmin();
  
  const enabledBanners = banners.filter((b) => b.enabled).sort((a, b) => a.order - b.order);
  
  const bannerWidth = screenWidth * 0.85;
  const bannerSpacing = 16;

  if (enabledBanners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={enabledBanners}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.bannerCard, { width: bannerWidth }]}
            onPress={() => {
              console.log('Banner pressed:', item.link);
            }}
            activeOpacity={0.95}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} />
            <View style={styles.bannerOverlay}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.bannerArrow}>
                <ArrowUpRight size={20} color={Colors.white} strokeWidth={2.5} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={bannerWidth + bannerSpacing}
        decelerationRate="fast"
        snapToAlignment="start"
        pagingEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  listContent: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  bannerCard: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden' as const,
    marginRight: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerImage: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: Colors.gray[200],
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
    justifyContent: 'space-between' as const,
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.white,
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginLeft: 12,
  },
});
