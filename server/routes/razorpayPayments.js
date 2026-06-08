const express = require('express');
const razorpayController = require('../controllers/razorpayController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', razorpayController.createOrder);
router.post('/verify-payment', razorpayController.verifyPayment);
router.get('/user-payments/:userId', razorpayController.getUserPayments);
router.get('/admin/payments', protect, authorize('admin'), razorpayController.getAdminPayments);

module.exports = router;
