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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Image as ImageIcon, Smile } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import SuccessPrompt from '@/components/SuccessPrompt';
import * as ImagePicker from 'expo-image-picker';
import { useSupabaseMessages } from '@/hooks/useSupabaseMessages';
import { useUser } from '@/contexts/UserContext';

export default function ChatScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useUser();
  
  const { messages: messagesData, isLoading, sendMessage: sendMsg, markAsRead } = useSupabaseMessages(conversationId || '');
  
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messagesData]);

  useEffect(() => {
    if (conversationId && user) {
      markAsRead();
    }
  }, [conversationId, user, markAsRead]);

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

  const handleSend = async () => {
    if (message.trim() && conversationId && !isSending) {
      setIsSending(true);
      try {
        await sendMsg(message.trim());
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
        setSuccessMessage('Failed to send message');
        setShowSuccess(true);
      } finally {
        setIsSending(false);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!conversationId) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>No conversation selected</Text>
        <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
          <Text style={styles.backButtonErrorText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Conversation</Text>
            <Text style={styles.headerSubtitle}>Chat</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentWrapper}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messagesData.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  msg.senderId === user?.id ? styles.userMessageWrapper : styles.agentMessageWrapper,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    msg.senderId === user?.id ? styles.userMessage : styles.agentMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.senderId === user?.id ? styles.userMessageText : styles.agentMessageText,
                    ]}
                  >
                    {msg.content}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      msg.senderId === user?.id ? styles.userMessageTime : styles.agentMessageTime,
                    ]}
                  >
                    {formatTime(msg.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

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
              style={[styles.sendButton, (!message.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Send size={20} color={Colors.white} />
              )}
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
  centered: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  backButtonError: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonErrorText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
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
    color: Colors.text.secondary,
    marginTop: 2,
  },
  contentWrapper: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
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
