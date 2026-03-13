const express = require('express');
const { body, param } = require('express-validator');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  extendBooking,
  checkInBooking,
  checkOutBooking
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createBookingValidation = [
  body('parkingSlot')
    .isMongoId()
    .withMessage('Invalid parking slot ID'),
  body('vehicle')
    .isMongoId()
    .withMessage('Invalid vehicle ID'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid ISO date'),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid ISO date'),
  body('bookingType')
    .isIn(['hourly', 'daily'])
    .withMessage('Booking type must be hourly or daily'),
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters')
];

const updateBookingValidation = [
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'])
    .withMessage('Invalid booking status')
];

const extendBookingValidation = [
  body('additionalHours')
    .isFloat({ min: 0.5 })
    .withMessage('Additional hours must be at least 0.5')
];

const checkInValidation = [
  body('checkInCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('Check-in code must be 6 characters')
    .isAlphanumeric()
    .withMessage('Check-in code must be alphanumeric')
];

const checkOutValidation = [
  body('checkOutCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('Check-out code must be 6 characters')
    .isAlphanumeric()
    .withMessage('Check-out code must be alphanumeric')
];

const bookingIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid booking ID')
];

// All routes require authentication
router.use(protect);

// Routes accessible by authenticated users
router.get('/', getBookings);
router.post('/', createBookingValidation, createBooking);

// Routes for specific booking
router.get('/:id', bookingIdValidation, getBooking);
router.put('/:id', bookingIdValidation, updateBookingValidation, updateBooking);
router.put('/:id/cancel', bookingIdValidation, cancelBooking);
router.put('/:id/extend', bookingIdValidation, extendBookingValidation, extendBooking);
router.post('/:id/checkin', bookingIdValidation, checkInValidation, checkInBooking);
router.post('/:id/checkout', bookingIdValidation, checkOutValidation, checkOutBooking);

module.exports = router;