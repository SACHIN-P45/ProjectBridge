require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const { socketHandler } = require('./socket/socketHandler');

// Connect to DB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketHandler(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/', (req, res) => res.json({ message: '🚀 ProjectBridge API is running!' }));

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
  console.log(`🌐 API: http://localhost:${PORT}`);
// Forced reload comment for .env change
});
