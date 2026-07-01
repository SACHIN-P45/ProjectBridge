const express = require('express');
const router = express.Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  getDeveloperProfile, 
  forgotPassword, 
  resetPassword,
  verifyEmail,
  resendVerification,
  oauthCallback,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Rate limiter for sensitive authentication endpoints (prevent brute force)
const authSensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 30,                   // max 30 attempts per window per IP
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Standard Auth Routes ─────────────────────────────────────
router.get('/test-email', async (req, res) => {
  const to = req.query.to || 'sachinabi67@gmail.com';
  const sendEmail = require('../utils/sendEmail');
  try {
    await sendEmail({
      to,
      subject: 'ProjectBridge Live Test Email',
      text: 'This is a test email sent from the live Render server to verify your email configurations.',
      html: '<h1>ProjectBridge Test</h1><p>This is a test email sent from the live Render server to verify your email configurations.</p>'
    });
    res.json({ success: true, message: `Email sent successfully to ${to}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/register', authSensitiveLimiter, register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authSensitiveLimiter, resendVerification);
router.post('/forgot-password', authSensitiveLimiter, forgotPassword);
router.put('/reset-password/:token', authSensitiveLimiter, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/developer/:id', protect, getDeveloperProfile);

// ── Google OAuth Routes ──────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed`,
    session: false,
  }),
  oauthCallback
);

// ── GitHub OAuth Routes ──────────────────────────────────────
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github_failed`,
    session: false,
  }),
  oauthCallback
);

module.exports = router;
