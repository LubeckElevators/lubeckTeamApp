import { Colors } from '@/constants/Colors';
import { useUser } from '@/context/UserContext';
import { db } from '@/firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChatMessage {
  messageId: string;
  userName: string;
  message: string;
  timestamp: Date;
  senderId: string;
  senderType: 'team' | 'owner';
}

interface ChatData {
  [messageId: string]: {
    userName: string;
    message: string;
    timestamp: any;
    senderId: string;
    senderType: 'team' | 'owner';
  };
}

export default function ChatScreen() {
  const colorScheme = 'dark'; // Force dark mode
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile } = useUser();
  const { siteId, siteName, ownerEmail } = useLocalSearchParams();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Generate unique message ID
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Convert Firestore timestamp to Date
  const convertTimestamp = (timestamp: any): Date => {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date(timestamp);
  };

  // Fetch messages from Firestore
  const fetchMessages = useCallback(async () => {
    if (!userProfile?.email || !siteId) {
      setIsLoading(false);
      return;
    }

    try {
      const teamSiteDocRef = doc(db, 'team', userProfile.email, 'sites', siteId as string);

      // Set up real-time listener
      const unsubscribe = onSnapshot(teamSiteDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const siteData = docSnapshot.data();
          const chatsMap: ChatData = siteData.chats || {};

          // Convert Map to array and sort by timestamp
          const messagesArray: ChatMessage[] = Object.entries(chatsMap).map(([messageId, messageData]) => ({
            messageId,
            userName: messageData.userName,
            message: messageData.message,
            timestamp: convertTimestamp(messageData.timestamp),
            senderId: messageData.senderId,
            senderType: messageData.senderType,
          }));

          // Sort messages by timestamp (newest first for display, but we'll reverse in FlatList)
          messagesArray.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          setMessages(messagesArray);
        }
        setIsLoading(false);
      });

      // Cleanup function to unsubscribe from listener
      return unsubscribe;
    } catch (error) {
      console.error('Error fetching messages:', error);
      setIsLoading(false);
    }
  }, [userProfile?.email, siteId]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !userProfile?.email || !siteId || isSending) {
      return;
    }

    setIsSending(true);

    try {
      const messageId = generateMessageId();
      const messageData = {
        userName: userProfile.name || 'Unknown User',
        message: newMessage.trim(),
        timestamp: new Date(),
        senderId: userProfile.email,
        senderType: 'team' as const,
      };

      // Update both paths
      const updatePromises = [];

      // Update team path
      const teamSiteDocRef = doc(db, 'team', userProfile.email, 'sites', siteId as string);
      const teamDoc = await getDoc(teamSiteDocRef);

      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        const existingChats = teamData.chats || {};
        const updatedChats = {
          ...existingChats,
          [messageId]: messageData,
        };

        updatePromises.push(
          updateDoc(teamSiteDocRef, { chats: updatedChats })
        );
      }

      // Update sites path if ownerEmail is available
      if (ownerEmail) {
        // Find the sites document ID
        const sitesCollectionRef = collection(db, 'sites');
        const sitesSnapshot = await getDocs(sitesCollectionRef);

        for (const siteDoc of sitesSnapshot.docs) {
          const siteData = siteDoc.data();
          if (siteData.ownerEmail === ownerEmail &&
              siteData.liftId === (siteData as any).liftId) {
            const existingChats = siteData.chats || {};
            const updatedChats = {
              ...existingChats,
              [messageId]: messageData,
            };

            updatePromises.push(
              updateDoc(doc(db, 'sites', siteDoc.id), { chats: updatedChats })
            );
            break;
          }
        }
      }

      await Promise.all(updatePromises);

      setNewMessage('');
      inputRef.current?.blur();

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Initialize messages listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      unsubscribe = await fetchMessages();
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === userProfile?.email;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {/* Sender name */}
        <Text style={[
          styles.senderLabel,
          isOwnMessage ? styles.ownSenderLabel : styles.otherSenderLabel
        ]}>
          {isOwnMessage ? 'You' : item.userName}
        </Text>

        {/* Message bubble */}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
        </View>

        {/* Timestamp */}
        <Text style={[
          styles.timestamp,
          isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={60} color={Colors[colorScheme ?? 'dark'].icon} />
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Start a conversation about this site</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {siteName || 'Site Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>Chat</Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.messageId}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        inverted={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={Colors.dark.icon}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || isSending) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
            activeOpacity={0.7}
          >
            {isSending ? (
              <Ionicons name="sync" size={20} color={Colors.dark.icon} />
            ) : (
              <Ionicons name="send" size={20} color={Colors.dark.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark.icon,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.tint,
    marginTop: 2,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.icon,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.icon,
    marginBottom: 4,
  },
  ownSenderLabel: {
    textAlign: 'right',
    color: Colors.dark.tint,
  },
  otherSenderLabel: {
    textAlign: 'left',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: SCREEN_WIDTH * 0.75,
  },
  ownMessageBubble: {
    backgroundColor: Colors.dark.tint,
  },
  otherMessageBubble: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: Colors.dark.text,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 2,
    color: Colors.dark.icon,
    opacity: 0.7,
  },
  ownTimestamp: {
    textAlign: 'right',
  },
  otherTimestamp: {
    textAlign: 'left',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12, // Extra padding for iOS bottom safe area
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    maxHeight: 100,
    paddingTop: 4,
    paddingBottom: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.dark.border,
  },
});
