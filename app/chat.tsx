import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Image as ImageIcon, Smile } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import SuccessPrompt from '@/components/SuccessPrompt';
import * as ImagePicker from 'expo-image-picker';
import { useBookings } from '@/contexts/BookingContext';
import BookingCard from '@/components/BookingCard';

interface Message {
  id: string;
  text?: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  type?: 'text' | 'booking';
  bookingId?: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { bookings, updateBookingStatus } = useBookings();
  
  const [message, setMessage] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (bookings.length > 0) {
      const latestBooking = bookings[bookings.length - 1];
      const existingBookingMessage = messages.find(m => m.bookingId === latestBooking.id);
      
      if (!existingBookingMessage) {
        const bookingMessage: Message = {
          id: `booking-${latestBooking.id}`,
          sender: 'user',
          timestamp: new Date(),
          type: 'booking',
          bookingId: latestBooking.id,
        };
        setMessages(prev => [...prev, bookingMessage]);
        console.log('Booking message added to chat:', bookingMessage);
      }
    }
  }, [bookings]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleAttachment = useCallback(async () => {
    console.log('Opening attachment picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSuccessMessage('Attachment Sent Successfully');
      setShowSuccess(true);
    }
  }, []);

  const handleEmoji = useCallback(() => {
    setShowEmojiPicker(!showEmojiPicker);
  }, [showEmojiPicker]);

  const selectEmoji = useCallback((emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  }, []);







  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleBookingStatusChange = useCallback((bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    updateBookingStatus(bookingId, newStatus);
    const statusMessages = {
      confirmed: 'Booking Confirmed Successfully',
      cancelled: 'Booking Canceled Successfully',
    };
    if (newStatus !== 'pending') {
      setSuccessMessage(statusMessages[newStatus]);
      setShowSuccess(true);
    }
  }, [updateBookingStatus]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 20 : insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Property Agent</Text>
            <Text style={styles.headerSubtitle}>Online</Text>
          </View>


        </View>
        

      </View>
      




      <View style={styles.contentWrapper}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
        {messages.map((msg) => {
          if (msg.type === 'booking' && msg.bookingId) {
            const booking = bookings.find(b => b.id === msg.bookingId);
            if (!booking) return null;
            return (
              <View key={msg.id} style={styles.bookingMessageWrapper}>
                <BookingCard 
                  booking={booking} 
                  onStatusChange={handleBookingStatusChange}
                />
              </View>
            );
          }

          return (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.sender === 'user' ? styles.userMessageWrapper : styles.agentMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userMessage : styles.agentMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === 'user' ? styles.userMessageText : styles.agentMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    msg.sender === 'user' ? styles.userMessageTime : styles.agentMessageTime,
                  ]}
                >
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          );
        })}
          <View style={{ height: 20 }} />
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: Platform.OS === 'web' ? 20 : insets.bottom + 20 }]}>
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.iconButton} onPress={handleAttachment}>
            <ImageIcon size={22} color={Colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.text.light}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.emojiButtonInInput} onPress={handleEmoji}>
              <Smile size={20} color={Colors.text.light} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        </View>
      </View>

      <SuccessPrompt
        visible={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />

      {showEmojiPicker && (
        <Modal
          visible={showEmojiPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <TouchableOpacity
            style={styles.emojiPickerOverlay}
            activeOpacity={1}
            onPress={() => setShowEmojiPicker(false)}
          >
            <View style={styles.emojiPickerContainer}>
              <Text style={styles.emojiPickerTitle}>Select Emoji</Text>
              <ScrollView contentContainerStyle={styles.emojiGrid}>
                {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🙏', '💪', '🦾', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '✨', '💫', '🔥', '💯', '✅', '☑️'].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.emojiButton}
                    onPress={() => selectEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.success,
    marginTop: 2,
  },

  contentWrapper: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  messagesContent: {
    padding: 20,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '75%' as const,
  },
  userMessageWrapper: {
    alignSelf: 'flex-end' as const,
  },
  agentMessageWrapper: {
    alignSelf: 'flex-start' as const,
  },
  messageBubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 6,
  },
  agentMessage: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: Colors.white,
  },
  agentMessageText: {
    color: Colors.text.primary,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  agentMessageTime: {
    color: Colors.text.light,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}10`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.gray[50],
    borderRadius: 28,
    paddingLeft: 18,
    paddingRight: 14,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    minHeight: 24,
    outlineStyle: 'none' as const,
  },
  emojiButtonInInput: {
    padding: 4,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  bookingMessageWrapper: {
    width: '100%' as const,
    marginBottom: 16,
  },

  emojiPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  emojiPickerContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: 400,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  emojiGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: 12,
    gap: 4,
  },
  emojiButton: {
    width: 44,
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
  },
  emojiText: {
    fontSize: 28,
  },
});
