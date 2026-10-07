import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

export interface ChatPartner {
  id: string;
  name: string;
  image?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserImage: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
  read: boolean;
  senderName: string;
  recipientName: string;
}

interface ChatContextType {
  getConversations: (userId: string) => Conversation[];
  getMessages: (userId: string, connectionId: string) => Message[];
  sendMessage: (sender: ChatPartner, recipient: ChatPartner, content: string, connectionId: string) => Promise<void>;
  startConversation: (currentUser: ChatPartner, other: ChatPartner) => void;
  markConversationRead: (userId: string, otherUserId: string) => void;
  totalUnread: (userId: string) => number;
  loadMessages: (connectionId: string) => Promise<void>; 
  loading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await api.getConversations();
        setConversations(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const getConversations = useCallback(
    (userId: string) => conversations,
    [conversations],
  );

  const loadMessages = useCallback(
    async (connectionId: string) => {
      try {
        const data = await api.getMessages(connectionId);
        setMessages((prev) => new Map(prev).set(connectionId, data.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          recipientId: m.recipientId,
          content: m.content,
          timestamp: new Date(m.createdAt).getTime(),
          read: m.read,
          senderName: m.sender.name,
          recipientName: m.recipient.name,
        }))));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      }
    },
    [],
  );

  const getMessages = useCallback(
    (userId: string, connectionId: string) => {
      return messages.get(connectionId) || [];
    },
    [messages],
  );

  const sendMessage = useCallback(
    async (sender: ChatPartner, recipient: ChatPartner, content: string, connectionId: string) => {
      try {
        const newMessage = await api.sendMessage(connectionId, content);
        
        // Update messages map
        setMessages((prev) => {
          const connectionMessages = prev.get(connectionId) || [];
          return new Map(prev).set(connectionId, [
            ...connectionMessages,
            {
              id: newMessage.id,
              senderId: newMessage.senderId,
              recipientId: newMessage.recipientId,
              content: newMessage.content,
              timestamp: new Date(newMessage.createdAt).getTime(),
              read: false,
              senderName: sender.name,
              recipientName: recipient.name,
            },
          ]);
        });

        // Update last message in conversations
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === connectionId
              ? { ...conv, lastMessage: content, lastMessageTime: Date.now() }
              : conv,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        throw err;
      }
    },
    [],
  );

  const startConversation = useCallback((currentUser: ChatPartner, other: ChatPartner) => {
    // Conversations are auto-created when messages are sent
  }, []);

  const markConversationRead = useCallback((userId: string, otherUserId: string) => {
    // Mark messages as read (optional - not blocking for MVP)
  }, []);

  const totalUnread = useCallback(
    (userId: string) => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  const value = useMemo(
    () => ({
      getConversations,
      getMessages,
      sendMessage,
      startConversation,
      markConversationRead,
      totalUnread,
      loadMessages,
      loading,
      error,
    }),
    [getConversations, getMessages, sendMessage, startConversation, markConversationRead, totalUnread, loading, error],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};