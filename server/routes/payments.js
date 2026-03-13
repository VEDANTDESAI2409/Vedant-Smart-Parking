const express = require('express');
const { body, param, query } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation rules
const paymentValidation = [
  body('bookingId').isMongoId().withMessage('Valid booking id is required'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash'])
    .withMessage('Invalid payment method'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
];

// @route GET /api/payments
// @desc Get payments (admin or user)
router.get('/', paymentController.getPayments);

// @route POST /api/payments
// @desc Process a payment (user)
router.post('/', paymentValidation, paymentController.processPayment);

// @route GET /api/payments/:id
// @desc Get payment by id
router.get('/:id', [param('id').isMongoId().withMessage('Invalid payment id')], paymentController.getPayment);

module.exports = router;
