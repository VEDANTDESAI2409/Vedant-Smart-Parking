const express = require('express');
const {
  adminLogin,
  getProfile,
  logout,
} = require('../controllers/authController');
const {
  sendOtp,
  verifyOtp,
  signup,
  login,
  verifyLogin,
  googleAuth,
} = require('../controllers/authPlaceholderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// User authentication routes (OTP-based)
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup', signup);
router.post('/login', login);
router.post('/login/verify', verifyLogin);
router.post('/google', googleAuth);

// Protected routes
router.get('/profile', protect, getProfile);
router.get('/logout', logout);

// Admin authentication routes
router.post('/admin/login', adminLogin);

module.exports = router;
