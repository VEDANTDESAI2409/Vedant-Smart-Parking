const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  parkingSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: [true, 'Booking must have a parking slot']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Booking must have a vehicle']
  },
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  bookingType: {
    type: String,
    enum: ['hourly', 'daily', 'monthly'],
    default: 'hourly'
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  actualStartTime: {
    type: Date,
    default: null
  },
  actualEndTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in hours
    required: true,
    min: [0.5, 'Minimum booking duration is 30 minutes']
  },
  pricing: {
    hourlyRate: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true }
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  checkInCode: {
    type: String,
    select: false // Only show to authorized users
  },
  checkOutCode: {
    type: String,
    select: false
  },
  extensions: [{
    extendedTo: Date,
    additionalHours: Number,
    additionalAmount: Number,
    extendedAt: { type: Date, default: Date.now }
  }],
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['user_cancelled', 'system_cancelled', 'no_show', 'payment_failed']
    },
    refundAmount: { type: Number, default: 0 }
  },
  ratings: {
    userRating: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 500 },
      ratedAt: Date
    },
    slotRating: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 500 },
      ratedAt: Date
    }
  },
  notifications: {
    reminderSent: { type: Boolean, default: false },
    checkInSent: { type: Boolean, default: false },
    checkOutSent: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for isActive
bookingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' &&
         this.startTime <= now &&
         this.endTime >= now;
});

// Virtual for isExpired
bookingSchema.virtual('isExpired').get(function() {
  return new Date() > this.endTime;
});

// Index for better query performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ parkingSlot: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1, startTime: 1 });

// Pre-save middleware to generate booking reference
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingReference) {
    this.bookingReference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  // Generate check-in and check-out codes
  if (this.isNew) {
    this.checkInCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.checkOutCode = Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  next();
});

// Static method to find conflicting bookings
bookingSchema.statics.findConflictingBookings = function(slotId, startTime, endTime, excludeBookingId = null) {
  const query = {
    parkingSlot: slotId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return this.find(query);
};

// Method to calculate total amount
bookingSchema.methods.calculateTotal = function() {
  let total = 0;

  if (this.bookingType === 'hourly') {
    total = this.pricing.hourlyRate * this.duration;
  } else if (this.bookingType === 'daily') {
    total = this.pricing.dailyRate * Math.ceil(this.duration / 24);
  }

  this.pricing.totalAmount = total;
  this.pricing.finalAmount = total - this.pricing.discountApplied + this.pricing.taxAmount;

  return this.pricing.finalAmount;
};

// Method to extend booking
bookingSchema.methods.extendBooking = function(additionalHours, additionalRate) {
  const extension = {
    extendedTo: new Date(this.endTime.getTime() + (additionalHours * 60 * 60 * 1000)),
    additionalHours,
    additionalAmount: additionalHours * additionalRate,
    extendedAt: new Date()
  };

  this.extensions.push(extension);
  this.endTime = extension.extendedTo;
  this.duration += additionalHours;
  this.pricing.finalAmount += extension.additionalAmount;

  return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancelBooking = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy,
    reason
  };

  // Calculate refund based on cancellation policy
  const now = new Date();
  const hoursUntilStart = (this.startTime - now) / (1000 * 60 * 60);

  if (hoursUntilStart >= 24) {
    this.cancellation.refundAmount = this.pricing.finalAmount; // Full refund
  } else if (hoursUntilStart >= 2) {
    this.cancellation.refundAmount = this.pricing.finalAmount * 0.5; // 50% refund
  } else {
    this.cancellation.refundAmount = 0; // No refund
  }

  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);