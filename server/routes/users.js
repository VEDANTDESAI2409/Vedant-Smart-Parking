const express = require('express');
const { body, param } = require('express-validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserActivity
} = require('../controllers/userController');

const { protect, authorize, adminRoleCheck } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', authorize('admin', 'superadmin'), getUsers);
router.delete('/:id', authorize('admin', 'superadmin'), userIdValidation, deleteUser);

// Routes accessible by admin or user themselves
router.get('/:id', userIdValidation, getUser);
router.put('/:id', userIdValidation, updateUserValidation, updateUser);
router.get('/:id/stats', userIdValidation, getUserStats);
router.get('/:id/activity', authorize('admin', 'superadmin'), userIdValidation, getUserActivity);

module.exports = router;