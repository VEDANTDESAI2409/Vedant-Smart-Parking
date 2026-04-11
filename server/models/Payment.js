const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payment must belong to a user']
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Payment must belong to a booking']
  },
  paymentReference: {
    type: String,
    unique: true,
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer', 'cash', 'upi', 'card']
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay', 'square', 'manual', 'upi_intent', 'simulation'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refund'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    sparse: true // Allows null but ensures uniqueness when present
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed, // Store gateway-specific response data
    default: {}
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  refundDetails: [{
    refundId: String,
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  taxDetails: {
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 }
  },
  fees: {
    processingFee: { type: Number, default: 0 },
    gatewayFee: { type: Number, default: 0 }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  verification: {
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: String,
      default: '',
    },
    webhookEventId: {
      type: String,
      default: '',
    },
    verificationReference: {
      type: String,
      default: '',
    },
  },
  receiptSnapshot: {
    bookingReference: { type: String, default: '' },
    slotNumber: { type: String, default: '' },
    locationName: { type: String, default: '' },
    city: { type: String, default: '' },
    area: { type: String, default: '' },
    pincode: { type: String, default: '' },
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total refunded amount
paymentSchema.virtual('totalRefunded').get(function() {
  return this.refundDetails.reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for net amount (after refunds and fees)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.totalRefunded - this.fees.processingFee - this.fees.gatewayFee;
});

// Index for better query performance
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ paymentReference: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentDate: 1 });
paymentSchema.index({ status: 1, paymentDate: -1 });

// Generate payment reference before validation so required fields exist on create
paymentSchema.pre('validate', function(next) {
  if (this.isNew && !this.paymentReference) {
    this.paymentReference = 'PAY' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = function(userId = null, dateRange = null) {
  const matchConditions = {};

  if (userId) {
    matchConditions.user = mongoose.Types.ObjectId(userId);
  }

  if (dateRange) {
    matchConditions.paymentDate = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        refundedAmount: { $sum: '$totalRefunded' }
      }
    }
  ]);
};

// Method to process refund
paymentSchema.methods.processRefund = function(amount, reason, refundedBy) {
  if (amount > (this.amount - this.totalRefunded)) {
    throw new Error('Refund amount exceeds available amount');
  }

  const refund = {
    refundId: 'REF' + Date.now() + Math.random().toString(36).substr(2, 3).toUpperCase(),
    amount,
    reason,
    refundedAt: new Date(),
    refundedBy
  };

  this.refundDetails.push(refund);

  if (amount === (this.amount - this.totalRefunded)) {
    this.status = 'refunded';
  } else {
    this.status = 'partial_refund';
  }

  return this.save();
};

// Method to update payment status
paymentSchema.methods.updateStatus = function(newStatus, transactionId = null, gatewayResponse = {}) {
  this.status = newStatus;

  if (transactionId) {
    this.transactionId = transactionId;
  }

  if (Object.keys(gatewayResponse).length > 0) {
    this.gatewayResponse = { ...this.gatewayResponse, ...gatewayResponse };
  }

  if (newStatus === 'completed') {
    this.paymentDate = new Date();
  }

  return this.save();
};

module.exports = mongoose.model('Payment', paymentSchema);
