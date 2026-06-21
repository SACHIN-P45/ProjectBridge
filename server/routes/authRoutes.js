const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile, 
  getDeveloperProfile, 
  forgotPassword, 
  resetPassword,
  verifyEmail,
  resendVerification
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/developer/:id', protect, getDeveloperProfile);

module.exports = router;
