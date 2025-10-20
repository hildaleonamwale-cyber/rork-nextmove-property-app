import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  participantAvatars: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  propertyId?: string;
  propertyTitle?: string;
}

export function useSupabaseConversations(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchConversations();
      
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*, messages(content, created_at, read, sender_id), properties(title)')
        .contains('participants', [userId])
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('Conversations fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      const transformedConversations = await Promise.all(
        (data || []).map(async (conv) => {
          const otherParticipants = conv.participants.filter((p: string) => p !== userId);
          const participantData = await Promise.all(
            otherParticipants.map(async (id: string) => {
              const { data: user } = await supabase
                .from('users')
                .select('name, avatar')
                .eq('id', id)
                .single();
              return user;
            })
          );

          const lastMessage = conv.messages?.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];

          const unreadCount = conv.messages?.filter(
            (m: any) => m.sender_id !== userId && !m.read
          ).length || 0;

          return {
            id: conv.id,
            participants: conv.participants,
            participantNames: participantData.map((p) => p?.name || 'User'),
            participantAvatars: participantData.map((p) => p?.avatar || ''),
            lastMessage: lastMessage?.content || '',
            lastMessageTime: lastMessage ? new Date(lastMessage.created_at) : new Date(),
            unreadCount,
            propertyId: conv.property_id,
            propertyTitle: conv.properties?.title,
          };
        })
      );

      setConversations(transformedConversations);
    } catch (err: any) {
      console.error('Failed to fetch conversations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { conversations, isLoading, error, refetch: fetchConversations };
}

export function useSupabaseMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();

      const channel = supabase
        .channel(`messages-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*, users(name, avatar)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Messages fetch error:', fetchError);
        throw new Error(fetchError.message);
      }

      setMessages(data?.map(transformMessage) || []);
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: session.user.id,
      content,
      read: false,
    });

    if (error) {
      console.error('Send message error:', error);
      throw new Error(error.message);
    }

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    await fetchMessages();
  };

  const markAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', session.user.id);
  };

  return { messages, isLoading, error, sendMessage, markAsRead, refetch: fetchMessages };
}

function transformMessage(data: any): Message {
  return {
    id: data.id,
    conversationId: data.conversation_id,
    senderId: data.sender_id,
    senderName: data.users?.name || 'User',
    senderAvatar: data.users?.avatar,
    content: data.content,
    read: data.read,
    createdAt: new Date(data.created_at),
  };
}
