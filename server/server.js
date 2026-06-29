require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');
const { connectDB } = require('./config/db');
const { socketHandler } = require('./socket/socketHandler');

// Connect to DB
connectDB().then(() => {
  const { syncAllDeveloperStats, syncAllStudentStats } = require('./utils/developerStats');
  syncAllDeveloperStats();
  syncAllStudentStats();
});

const app = express();
const server = http.createServer(app);

// ── Security Headers (helmet) ────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow Socket.IO & external assets
  contentSecurityPolicy: false,     // Managed by client; relax for API server
}));

// ── Rate Limiting ────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,                    // max 20 requests per window per IP
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Socket.IO ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketHandler(io);

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Session (used only transiently for Passport OAuth flow) ──
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'projectbridge_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 5 * 60 * 1000 }, // 5 minute session window
  })
);

// ── Passport ─────────────────────────────────────────────────
app.use(passport.initialize());

// ── Serve static uploads ─────────────────────────────────────
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/bids', require('./routes/bidRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: '🚀 ProjectBridge API is running!' }));

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File is too large. The maximum allowed size is 100MB.';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
  console.log(`🌐 API: http://localhost:${PORT}`);
});

