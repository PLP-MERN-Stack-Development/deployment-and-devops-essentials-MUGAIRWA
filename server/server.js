// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};
const rooms = ['general']; // Default room

// Namespaces for better organization
const chatNamespace = io.of('/chat');
const notificationNamespace = io.of('/notification');

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      room: socket.room || 'general', // Add room info
      reactions: [], // Initialize reactions
      readBy: [], // Initialize read receipts
      delivered: false, // Initialize delivery status
    };

    messages.push(message);

    // Limit stored messages to prevent memory issues
    if (messages.length > 100) {
      messages.shift();
    }

    // Emit to room instead of all
    io.to(message.room).emit('receive_message', message);

    // Send acknowledgment to sender
    socket.emit('message_ack', { messageId: message.id, status: 'delivered' });
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle room joining
  socket.on('join_room', (roomName) => {
    socket.room = roomName;
    socket.join(roomName);
    console.log(`${users[socket.id]?.username || 'Anonymous'} joined room: ${roomName}`);
  });

  // Handle room creation
  socket.on('create_room', (roomName) => {
    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
      io.emit('room_list', rooms);
      console.log(`Room created: ${roomName}`);
    }
  });

  // Handle file upload
  socket.on('send_file', (fileData) => {
    const message = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      room: socket.room || 'general',
      file: {
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        url: `/uploads/${fileData.name}`, // This will be set after upload
      },
      reactions: [],
      readBy: [],
    };

    messages.push(message);
    io.to(message.room).emit('receive_message', message);
  });

  // Handle message reactions
  socket.on('add_reaction', ({ messageId, emoji }) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      const existingReaction = message.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        existingReaction.count += 1;
      } else {
        message.reactions.push({ emoji, count: 1 });
      }
      io.to(message.room).emit('message_updated', message);
    }
  });

  // Handle read receipts
  socket.on('mark_as_read', (messageId) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message && !message.readBy.includes(socket.id)) {
      message.readBy.push(socket.id);
      io.to(message.room).emit('message_updated', message);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }

    delete users[socket.id];
    delete typingUsers[socket.id];

    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const room = req.query.room || 'general';

  // Filter messages by room
  const roomMessages = messages.filter(msg => msg.room === room);

  // Paginate messages
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedMessages = roomMessages.slice(startIndex, endIndex);

  res.json({
    messages: paginatedMessages,
    total: roomMessages.length,
    page,
    limit,
    hasMore: endIndex < roomMessages.length
  });
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

// File upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({
      filename: req.file.filename,
      originalname: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
    });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 