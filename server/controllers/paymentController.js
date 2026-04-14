const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const ActivityLog = require('../models/ActivityLog');
const ParkingSlot = require('../models/ParkingSlot');

const generateReference = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const toShortDisplayCode = (value, prefix) => {
  const normalized = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const digitsOnly = normalized.replace(/\D/g, '');
  const suffix = (digitsOnly || normalized).slice(-4).padStart(4, '0');
  return `${prefix}${suffix}`;
};

const buildUpiLink = (scheme, { pa, pn, am, cu, tn, tr }) =>
  `${scheme}://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&am=${encodeURIComponent(
    am
  )}&cu=${encodeURIComponent(cu)}&tn=${encodeURIComponent(tn)}&tr=${encodeURIComponent(tr)}`;

const releaseSlotForBooking = async (booking) => {
  const slot = await ParkingSlot.findById(booking.parkingSlot);
  if (!slot) {
    return null;
  }

  slot.lockExpiresAt = null;
  slot.lockedBy = null;
  slot.lockToken = null;
  slot.currentBooking = null;
  slot.status = 'available';
  await slot.save();
  return slot;
};

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

// @desc    Initiate payment for the smart booking flow
// @route   POST /api/payments/initiate
// @access  Private
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, upiApp, cardLast4 } = req.body;
    const booking = await Booking.findById(bookingId).populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (String(booking.user._id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (
      !booking.paymentLock?.expiresAt ||
      booking.paymentLock.expiresAt.getTime() <= Date.now()
    ) {
      await releaseSlotForBooking(booking);
      booking.status = 'cancelled';
      booking.paymentStatus = 'failed';
      await booking.save();

      return res.status(409).json({
        success: false,
        message: 'Booking lock expired. Please select a slot again.',
      });
    }

    let payment = booking.payment ? await Payment.findById(booking.payment) : null;
    if (!payment) {
      payment = await Payment.create({
        user: req.user.id,
        booking: booking._id,
        amount: booking.pricing.finalAmount,
        paymentMethod,
        paymentGateway: paymentMethod === 'upi' ? 'upi_intent' : 'simulation',
        status: 'processing',
        transactionId: generateReference('TXN'),
        metadata: {
          upiApp: upiApp || '',
          cardLast4: cardLast4 || '',
        },
        receiptSnapshot: {
          bookingReference: booking.bookingReference,
          slotNumber: booking.locationSnapshot.slotNumber,
          locationName: booking.locationSnapshot.locationName,
          city: booking.locationSnapshot.city,
          area: booking.locationSnapshot.area,
          pincode: booking.locationSnapshot.pincode,
        },
      });

      booking.payment = payment._id;
      booking.paymentStatus = 'processing';
      await booking.save();
    }

    const merchantUpiId = process.env.UPI_MERCHANT_ID || 'merchant@upi';
    const merchantName = process.env.UPI_MERCHANT_NAME || 'ParkingApp';
    const upiPayload = {
      pa: merchantUpiId,
      pn: merchantName,
      am: booking.pricing.finalAmount.toFixed(2),
      cu: 'INR',
      tn: `SlotBooking ${booking.bookingReference}`,
      tr: payment.transactionId,
    };

    const session = {
      paymentId: payment._id,
      bookingId: booking._id,
      amount: booking.pricing.finalAmount,
      currency: 'INR',
      method: paymentMethod,
      expiresAt: booking.paymentLock.expiresAt,
    };

    if (paymentMethod === 'upi') {
      session.upiLinks = {
        generic: buildUpiLink('upi', upiPayload),
        gpay: buildUpiLink('gpay://upi', upiPayload),
        phonepe: buildUpiLink('phonepe', upiPayload),
        paytm: buildUpiLink('paytmmp', upiPayload),
      };
    } else {
      session.card = {
        gateway: process.env.CARD_PAYMENT_PROVIDER || 'simulation',
        clientSecret: generateReference('CARD'),
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      };
    }

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        payment,
        session,
      },
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error initiating payment',
    });
  }
};

// @desc    Verify payment for the smart booking flow
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, bookingId, status, transactionId, gatewayResponse = {} } = req.body;
    const payment = await Payment.findById(paymentId);
    const booking = await Booking.findById(bookingId).populate('user', 'name email phone');

    if (!payment || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Payment or booking not found',
      });
    }

    if (String(booking.user._id) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const slot = await ParkingSlot.findById(booking.parkingSlot);

    if (status === 'success') {
      payment.status = 'completed';
      payment.transactionId = transactionId || payment.transactionId || generateReference('TXN');
      payment.gatewayResponse = gatewayResponse;
      payment.verification = {
        verifiedAt: new Date(),
        verifiedBy: payment.paymentGateway,
        verificationReference: transactionId || payment.transactionId,
      };
      await payment.save();

      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.paymentLock = {
        lockToken: null,
        lockedAt: null,
        expiresAt: null,
      };
      await booking.save();

      if (slot) {
        slot.lockExpiresAt = null;
        slot.lockedBy = null;
        slot.lockToken = null;
        slot.currentBooking = booking._id;
        slot.status = 'occupied';
        await slot.save();
      }

      await ActivityLog.logActivity({
        user: req.user.id,
        action: 'payment_completed',
        resource: 'payment',
        resourceId: payment._id,
        description: `Payment verified for booking ${booking.bookingReference}`,
        details: { transactionId: payment.transactionId, amount: payment.amount },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          booking,
          payment,
          receipt: {
            bookingId: toShortDisplayCode(booking.bookingReference, 'BK'),
            receiptNumber: toShortDisplayCode(booking.receiptNumber, 'RC'),
            name: booking.user.name,
            slot: booking.locationSnapshot.slotNumber,
            location: booking.locationSnapshot.locationName,
            dateTime: booking.startTime,
            duration: booking.duration,
            amount: booking.pricing.finalAmount,
            paymentStatus: 'PAID',
          },
        },
      });
    }

    payment.status = status === 'pending' ? 'pending' : 'failed';
    payment.gatewayResponse = gatewayResponse;
    await payment.save();

    if (status === 'failed') {
      booking.status = 'cancelled';
      booking.paymentStatus = 'failed';
      await booking.save();
      await releaseSlotForBooking(booking);
    }

    res.status(200).json({
      success: true,
      message: status === 'pending' ? 'Payment pending' : 'Payment marked failed',
      data: {
        booking,
        payment,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment',
    });
  }
};
