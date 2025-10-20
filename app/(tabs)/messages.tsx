import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MessageCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { DesignSystem } from '@/constants/designSystem';
import UniformHeader from '@/components/UniformHeader';

interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversationsData } = trpc.messages.listConversations.useQuery();

  const mockChats: ChatPreview[] = [
    {
      id: '1',
      name: 'Property Agent',
      lastMessage: 'The property includes 2 underground parking spaces...',
      timestamp: '2:30 PM',
      unread: 2,
      online: true,
    },
    {
      id: '2',
      name: 'Downtown Realty',
      lastMessage: 'We have similar properties in that area',
      timestamp: 'Yesterday',
      unread: 0,
      online: false,
    },
    {
      id: '3',
      name: 'Elite Homes',
      lastMessage: 'Thank you for your interest!',
      timestamp: 'Monday',
      unread: 0,
      online: true,
    },
  ];

  const chats = conversationsData?.conversations.map(conv => ({
    id: conv.userId,
    name: conv.userName || 'User',
    lastMessage: conv.lastMessage || '',
    timestamp: conv.timestamp
      ? new Date(conv.timestamp).toLocaleDateString()
      : '',
    unread: conv.unreadCount || 0,
    online: false,
  })) || mockChats;

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <UniformHeader 
        title="Messages"
        showBorder={false}
      />
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={Colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => router.push('/chat')}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <MessageCircle size={24} color={Colors.white} />
                </View>
                {chat.online && <View style={styles.onlineIndicator} />}
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{chat.timestamp}</Text>
                </View>
                <View style={styles.chatFooter}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyText}>No messages found</Text>
          </View>
        )}
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
  searchContainer: {
    paddingHorizontal: DesignSystem.contentPadding,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row' as const,
    padding: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.contentPadding,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  avatarContainer: {
    position: 'relative' as const,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  onlineIndicator: {
    position: 'absolute' as const,
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  chatHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 6,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  chatTime: {
    fontSize: 13,
    color: Colors.text.light,
  },
  chatFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  lastMessage: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500' as const,
    color: Colors.text.secondary,
    marginTop: 16,
  },
});
