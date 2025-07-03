import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user, isAuthenticated } = useAuth();

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const wsUrl = backendUrl.replace('http', 'ws');
      const ws = new WebSocket(`${wsUrl}/ws/${user.id}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setSocket(ws);
      };
      
      ws.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        console.log('Received message:', messageData);
        
        // Add message to the appropriate conversation
        const conversationId = messageData.sender_id === user.id 
          ? messageData.receiver_id 
          : messageData.sender_id;
        
        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), messageData]
        }));
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setSocket(null);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      return () => {
        ws.close();
      };
    }
  }, [isAuthenticated, user]);

  // Send message
  const sendMessage = async (receiverId, content) => {
    if (!socket || !user) return;
    
    const messageData = {
      receiver_id: receiverId,
      content: content,
      message_type: 'text'
    };
    
    try {
      socket.send(JSON.stringify(messageData));
      
      // Add message to local state immediately
      const message = {
        id: Date.now().toString(), // temporary ID
        sender_id: user.id,
        receiver_id: receiverId,
        content: content,
        created_at: new Date().toISOString(),
        is_read: false
      };
      
      setMessages(prev => ({
        ...prev,
        [receiverId]: [...(prev[receiverId] || []), message]
      }));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to send message' 
      };
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (otherUserId) => {
    try {
      const response = await axios.get(`/api/messages/${otherUserId}`);
      setMessages(prev => ({
        ...prev,
        [otherUserId]: response.data
      }));
      return { success: true, messages: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to fetch messages' 
      };
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      await axios.put(`/api/messages/${messageId}/read`);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to mark message as read' 
      };
    }
  };

  // Get unread message count
  const getUnreadCount = (userId) => {
    if (!messages[userId]) return 0;
    return messages[userId].filter(msg => 
      !msg.is_read && msg.receiver_id === user?.id
    ).length;
  };

  // Get total unread count
  const getTotalUnreadCount = () => {
    return Object.values(messages).reduce((total, conversation) => {
      return total + conversation.filter(msg => 
        !msg.is_read && msg.receiver_id === user?.id
      ).length;
    }, 0);
  };

  // Get conversation list
  const getConversations = () => {
    const conversations = [];
    Object.keys(messages).forEach(userId => {
      const conversationMessages = messages[userId];
      if (conversationMessages.length > 0) {
        const lastMessage = conversationMessages[conversationMessages.length - 1];
        conversations.push({
          userId,
          lastMessage,
          unreadCount: getUnreadCount(userId)
        });
      }
    });
    
    // Sort by last message date
    conversations.sort((a, b) => 
      new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
    );
    
    return conversations;
  };

  // Start conversation
  const startConversation = (userId) => {
    setActiveChat(userId);
    if (!messages[userId]) {
      fetchMessages(userId);
    }
  };

  // Close conversation
  const closeConversation = () => {
    setActiveChat(null);
  };

  const value = {
    messages,
    activeChat,
    socket,
    onlineUsers,
    sendMessage,
    fetchMessages,
    markMessageAsRead,
    getUnreadCount,
    getTotalUnreadCount,
    getConversations,
    startConversation,
    closeConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};