import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'message' | 'property' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: Date;
}

export function useSupabaseNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchNotifications();

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Notifications fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      const transformed = data?.map(transformNotification) || [];
      setNotifications(transformed);
      setUnreadCount(transformed.filter((n) => !n.read).length);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Mark notification as read error:', error);
      throw new Error(error.message);
    }

    await fetchNotifications();
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Mark all notifications as read error:', error);
      throw new Error(error.message);
    }

    await fetchNotifications();
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Delete notification error:', error);
      throw new Error(error.message);
    }

    await fetchNotifications();
  };

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}

function transformNotification(data: any): Notification {
  const parseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };
  
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    title: data.title,
    message: data.message,
    read: data.read,
    data: data.data,
    createdAt: parseDate(data.created_at),
  };
}
