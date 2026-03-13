const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin or Own Payments
exports.getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    } else {
      if (req.query.user) filter.user = req.query.user;
    }

    if (req.query.status) filter.status = req.query.status;
    if (req.query.booking) filter.booking = req.query.booking;

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.paymentDate = {};
      if (req.query.startDate) filter.paymentDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.paymentDate.$lte = new Date(req.query.endDate);
    }

    // Sort
    const sort = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder === 'desc' ? -1 : 1 } : { createdAt: -1 };

    const payments = await Payment.find(filter)
      .populate('user', 'name email')
      .populate('booking', 'bookingReference startTime endTime')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving payments'
    });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private/Admin or Payment Owner
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('booking')
      .populate('refundDetails.refundedBy', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving payment'
    });
  }
};

// @desc    Process payment
// @route   POST /api/payments
// @access  Private
exports.processPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { bookingId, paymentMethod, amount } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking already has a payment
    if (booking.payment) {
      return res.status(400).json({
        success: false,
        message: 'Booking already has a payment'
      });
    }

    // Validate amount
    if (amount !== booking.pricing.finalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match booking amount'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      user: req.user.id,
      booking: bookingId,
      amount,
      paymentMethod,
      status: 'completed', // In real implementation, this would be 'pending' until gateway confirms
      paymentDate: new Date()
    });

    // Update booking with payment reference
    booking.payment = payment._id;
    await booking.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'payment_completed',
      resource: 'payment',
      resourceId: payment._id,
      description: `Payment completed: $${amount} for booking ${booking.bookingReference}`,
      details: { paymentMethod, amount },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing payment'
    });
  }
};

// @desc    Process refund
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
exports.processRefund = async (req, res) => {
  try {
    const { amount, reason } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Process refund
    await payment.processRefund(amount, reason, req.user.id);

    // Log activity
    await ActivityLog.logActivity({
      admin: req.user.id,
      action: 'payment_refunded',
      resource: 'payment',
      resourceId: payment._id,
      description: `Payment refunded: $${amount} - ${reason}`,
      details: { amount, reason },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: { payment }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing refund'
    });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
exports.getPaymentStats = async (req, res) => {
  try {
    const dateRange = req.query.dateRange ? JSON.parse(req.query.dateRange) : null;

    const stats = await Payment.getPaymentStats(null, dateRange);

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving payment statistics'
    });
  }
};