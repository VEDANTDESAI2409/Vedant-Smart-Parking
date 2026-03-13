const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/reports/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard', reportController.getDashboardStats);

// @route   GET /api/reports
// @desc    Get all reports
// @access  Private/Admin
router.get('/', reportController.getReports);

// @route   GET /api/reports/:id
// @desc    Get single report
// @access  Private/Admin
router.get('/:id', reportController.getReport);

// @route   POST /api/reports
// @desc    Create new report
// @access  Private/Admin
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Report title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('type')
      .isIn(['revenue', 'occupancy', 'user_activity', 'booking_analytics'])
      .withMessage('Invalid report type'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('parameters.dateRange.start')
      .isISO8601()
      .withMessage('Valid start date is required'),
    body('parameters.dateRange.end')
      .isISO8601()
      .withMessage('Valid end date is required')
      .custom((endDate, { req }) => {
        if (new Date(endDate) <= new Date(req.body.parameters.dateRange.start)) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ],
  reportController.createReport
);

// @route   DELETE /api/reports/:id
// @desc    Delete report
// @access  Private/Admin
router.delete('/:id', reportController.deleteReport);

module.exports = router;