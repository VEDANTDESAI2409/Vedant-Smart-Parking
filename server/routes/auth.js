const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  updateAdminProfile, // NEW IMPORT
  changePassword,
  logout,
  refreshToken
} = require('../controllers/authController');
const {
  sendOtp,
  verifyOtp,
  resendOtp,
  createFirebaseSession,
  getAuthenticatedProfile,
} = require('../controllers/providerAuthController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').matches(/^\+?[\d\s-()]{10,}$/).withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const phoneValidation = [
  body('phone')
    .trim(),
  body('phone')
    .matches(/^\+[1-9]\d{7,14}$/)
    .withMessage('Phone number must be in E.164 format'),
];

const otpVerificationValidation = [
  ...phoneValidation,
  body('code').trim().isLength({ min: 4, max: 10 }).withMessage('OTP code is required'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail().withMessage('Please provide a valid email'),
];

const firebaseSessionValidation = [
  body('idToken').trim().notEmpty().withMessage('Firebase ID token is required'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).matches(/^\+[1-9]\d{7,14}$/),
];

const updateAdminValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/signup', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/admin/login', loginValidation, adminLogin);
router.post('/send-otp', phoneValidation, sendOtp);
router.post('/resend-otp', phoneValidation, resendOtp);
router.post('/verify-otp', otpVerificationValidation, verifyOtp);
router.post('/firebase/session', firebaseSessionValidation, createFirebaseSession);

// Protected routes
router.use(protect); 

router.get('/profile', getProfile);
router.get('/me', getAuthenticatedProfile);
router.put('/profile', updateProfile);
router.put('/admin/profile', updateAdminValidation, updateAdminProfile); // NEW ADMIN ROUTE
router.put('/change-password', changePassword);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

module.exports = router;
