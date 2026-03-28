import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Home, MessageCircle, Calendar, Heart, User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const icons = {
    wishlist: Heart,
    messages: MessageCircle,
    home: Home,
    bookings: Calendar,
    account: User,
  };

  const routes = ['wishlist', 'messages', 'home', 'bookings', 'account'];

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: Platform.select({
            ios: insets.bottom || 20,
            default: 20,
          }),
        },
      ]}
    >
      <View style={styles.tabBar}>
        {routes.map((route, index) => {
          const isFocused = state.routes[state.index]?.name === route;
          const Icon = icons[route as keyof typeof icons];

          const onPress = () => {
            if (!isFocused) {
              router.push(`/(tabs)/${route}` as any);
            }
          };

          if (route === 'home') {
            return (
              <View key={route} style={styles.floatingButtonContainer}>
                <TouchableOpacity
                  onPress={onPress}
                  style={styles.floatingButton}
                  activeOpacity={0.8}
                >
                  <Icon size={28} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Icon
                size={24}
                color={isFocused ? Colors.primary : '#94A3B8'}
                strokeWidth={isFocused ? 2.5 : 2}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="wishlist" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center' as const,
  },
  tabBar: {
    flexDirection: 'row' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  tabButton: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 50,
    height: 50,
  },
  floatingButtonContainer: {
    position: 'relative' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginHorizontal: 10,
  },
  floatingButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: -32,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: `0 8px 24px ${Colors.primary}66`,
      },
    }),
  },
});
