// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profileRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const connectionRoutes = require('./routes/connectionRoutes');

const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
require('./config/passport-setup');

const app = express();
const server = http.createServer(app);

// --- Socket.io Setup ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  console.log('🚦 New socket connection:', socket.id);
  console.log('🔐 User ID from client auth:', userId);

  if (userId && userId !== 'undefined') {
    userSocketMap[userId] = socket.id;
    console.log(`✅ Mapped userId ${userId} to socket ${socket.id}`);
  } else {
    console.warn('❌ Invalid or missing userId on socket connect');
  }

  // Realtime messaging system
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    if (!senderId || !receiverId || !message) {
      console.error('❌ Missing required fields in sendMessage');
      return;
    }

    try {
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      let isNewConversation = false;

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
        isNewConversation = true;
      }

      const newMessage = new Message({ senderId, receiverId, message });
      conversation.messages.push(newMessage._id);
      await Promise.all([conversation.save(), newMessage.save()]);

      const receiverSocketId = userSocketMap[receiverId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newMessage);

        if (isNewConversation) {
          io.to(receiverSocketId).emit('newConversation', {
            conversationId: conversation._id,
            senderId,
            message: newMessage.message,
            createdAt: newMessage.createdAt,
          });
        }
      }
    } catch (error) {
      console.error('🔥 Error in sendMessage:', error);
    }
  });

  // =========================
  // WebRTC Signaling Events
  // =========================
  socket.on('join-room', ({ roomId, userId }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.roomUserId = userId;
    console.log(`👥 ${userId} joined room ${roomId}`);
    socket.to(roomId).emit('user-connected', { userId });
  });

  socket.on('leave-room', ({ roomId, userId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-disconnected', { userId });
  });

  socket.on('offer', ({ roomId, sdp }) => {
    socket.to(roomId).emit('offer', { sdp });
  });

  socket.on('answer', ({ roomId, sdp }) => {
    socket.to(roomId).emit('answer', { sdp });
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
    if (socket.roomId && socket.roomUserId) {
      socket.to(socket.roomId).emit('user-disconnected', { userId: socket.roomUserId });
    }
    if (userId) {
      delete userSocketMap[userId];
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }
  });
});

// --- Express Middleware ---
app.use(express.json({ limit: '5mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  next();
});

// --- Routes ---
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/connections', connectionRoutes);
// --- MongoDB + Server Init ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`✅ Connected to DB & Listening on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ DB connection failed:', err));
