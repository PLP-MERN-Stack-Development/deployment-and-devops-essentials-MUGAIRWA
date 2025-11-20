// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
});

// Notification sound
const notificationSound = new Audio('/notification.mp3'); // Add notification.mp3 to public folder

// Request notification permission
const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

// Play sound notification
const playSound = () => {
  notificationSound.play().catch(e => console.log('Sound play failed:', e));
};

// Show browser notification
const showBrowserNotification = (title, body) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
};

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected', 'connecting', 'disconnected'
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
      requestNotificationPermission();
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message) => {
    socket.emit('send_message', { message });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Join a room
  const joinRoom = (roomName) => {
    socket.emit('join_room', roomName);
  };

  // Create a room
  const createRoom = (roomName) => {
    socket.emit('create_room', roomName);
  };

  // Send a file
  const sendFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      socket.emit('send_file', {
        name: data.filename,
        type: file.type,
        size: file.size,
        url: data.url,
      });
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  // Add reaction to message
  const addReaction = (messageId, emoji) => {
    socket.emit('add_reaction', { messageId, emoji });
  };

  // Mark message as read
  const markAsRead = (messageId) => {
    socket.emit('mark_as_read', messageId);
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    const onReconnect = () => {
      setConnectionStatus('connected');
      // Re-join rooms and update user status on reconnect
      if (socket.username) {
        socket.emit('user_join', socket.username);
      }
    };

    const onReconnecting = () => {
      setConnectionStatus('connecting');
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);

      // Play sound and show browser notification if not focused
      if (document.hidden) {
        playSound();
        showBrowserNotification('New Message', `${message.sender}: ${message.message || 'Sent a file'}`);
      }
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);

      // Always play sound and show notification for private messages
      playSound();
      showBrowserNotification('Private Message', `${message.sender}: ${message.message}`);
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      // Add system message and show notification
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Show browser notification for user join
      if (document.hidden) {
        showBrowserNotification('User Joined', `${user.username} joined the chat`);
      }
    };

    const onUserLeft = (user) => {
      // Add system message and show notification
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Show browser notification for user leave
      if (document.hidden) {
        showBrowserNotification('User Left', `${user.username} left the chat`);
      }
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Message update events
    const onMessageUpdated = (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    };

    // Room list event
    const onRoomList = (roomList) => {
      // This could be used to update rooms if needed
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('reconnecting', onReconnecting);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('message_updated', onMessageUpdated);
    socket.on('room_list', onRoomList);
    socket.on('message_ack', (ack) => {
      // Update message delivery status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === ack.messageId ? { ...msg, delivered: true } : msg
        )
      );
    });

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('message_updated', onMessageUpdated);
      socket.off('room_list', onRoomList);
    };
  }, []);

  // Fetch paginated messages
  const fetchMessages = async (room = 'general', page = 1, limit = 20) => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages?room=${room}&page=${page}&limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return { messages: [], hasMore: false };
    }
  };

  return {
    socket,
    isConnected,
    connectionStatus,
    lastMessage,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    createRoom,
    sendFile,
    addReaction,
    markAsRead,
    setTyping,
    fetchMessages,
  };
};

export default socket; 