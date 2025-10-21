import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Bell, MessageCircle, Calendar, Heart, Home } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DesignSystem } from '@/constants/designSystem';
import UniformHeader from '@/components/UniformHeader';
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications';
import { useUser } from '@/contexts/UserContext';

interface Notification {
  id: string;
  type: 'message' | 'booking' | 'like' | 'property';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationsScreen() {
  const { user } = useUser();
  const { 
    notifications: notificationsData, 
    markAsRead: markAsReadMutation, 
    deleteNotification: deleteNotificationMutation 
  } = useSupabaseNotifications(user?.id || '');

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'message',
      title: 'New message from Property Agent',
      description: 'The property includes 2 underground parking spaces...',
      timestamp: '5 min ago',
      read: false,
    },
    {
      id: '2',
      type: 'booking',
      title: 'Booking Confirmed',
      description: 'Your viewing for Luxury Penthouse is scheduled for Tuesday at 2 PM',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      type: 'property',
      title: 'New Property Match',
      description: 'A new property matching your preferences is now available',
      timestamp: '3 hours ago',
      read: true,
    },
    {
      id: '4',
      type: 'like',
      title: 'Property Saved',
      description: 'Modern Villa has been added to your saved properties',
      timestamp: 'Yesterday',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return MessageCircle;
      case 'booking':
        return Calendar;
      case 'like':
        return Heart;
      case 'property':
        return Home;
      default:
        return Bell;
    }
  };

  const notifications = notificationsData.length > 0 ? notificationsData.map(n => ({
    id: n.id,
    type: n.type as 'message' | 'booking' | 'like' | 'property',
    title: n.title,
    description: n.message,
    timestamp: new Date(n.createdAt).toLocaleDateString(),
    read: n.read,
  })) : mockNotifications;

  const handleClearAll = async () => {
    for (const notification of notifications) {
      if (!notification.read) {
        await deleteNotificationMutation(notification.id);
      }
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'message':
        return '#06B6D4';
      case 'booking':
        return '#4FD2C5';
      case 'like':
        return '#EF4444';
      case 'property':
        return Colors.primary;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      <UniformHeader 
        title="Notifications"
        rightComponent={
          <TouchableOpacity style={styles.markAllButton} onPress={handleClearAll}>
            <Text style={styles.markAllText}>Clear All</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          const iconColor = getIconColor(notification.type);

          return (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.notificationUnread]}
              onPress={() => {
                if (!notification.read) {
                  markAsReadMutation(notification.id);
                }
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                <Icon size={24} color={iconColor} />
              </View>

              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationDescription} numberOfLines={2}>
                  {notification.description}
                </Text>
                <Text style={styles.notificationTime}>{notification.timestamp}</Text>
              </View>

              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  markAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.gray[100],
  },
  markAllText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: DesignSystem.contentPadding,
    backgroundColor: '#FFFFFF',
  },
  notificationCard: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: '#FFFFFF',
    borderRadius: DesignSystem.card.borderRadius,
    padding: DesignSystem.card.padding,
    marginBottom: DesignSystem.spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 14,
  },
  notificationUnread: {
    backgroundColor: `${Colors.primary}05`,
    borderColor: `${Colors.primary}20`,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.text.light,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
});
