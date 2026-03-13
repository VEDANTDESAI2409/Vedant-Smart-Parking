const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must belong to a user']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: [
      'booking_confirmed',
      'booking_reminder',
      'booking_cancelled',
      'payment_successful',
      'payment_failed',
      'check_in_reminder',
      'check_out_reminder',
      'booking_extended',
      'slot_available',
      'system_maintenance',
      'promotion',
      'account_update'
    ]
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {} // Store additional data like bookingId, paymentId, etc.
  },
  channels: [{
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    default: ['in_app']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  sentAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  deliveryStatus: {
    email: {
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      failed: { type: Boolean, default: false },
      error: String
    },
    sms: {
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      failed: { type: Boolean, default: false },
      error: String
    },
    push: {
      sent: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      failed: { type: Boolean, default: false },
      error: String
    }
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 30 days from creation
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for isExpired
notificationSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for isRead
notificationSchema.virtual('isRead').get(function() {
  return this.status === 'read';
});

// Index for better query performance
notificationSchema.index({ user: 1, status: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion
notificationSchema.index({ 'deliveryStatus.email.sent': 1 });
notificationSchema.index({ 'deliveryStatus.sms.sent': 1 });
notificationSchema.index({ 'deliveryStatus.push.sent': 1 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set sentAt when status changes to sent
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }

  // Set readAt when status changes to read
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }

  next();
});

// Static method to create notification
notificationSchema.statics.createNotification = function(userId, type, title, message, data = {}, channels = ['in_app'], priority = 'medium', createdBy = null) {
  return this.create({
    user: userId,
    type,
    title,
    message,
    data,
    channels,
    priority,
    createdBy
  });
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    user: userId,
    status: { $ne: 'read' },
    expiresAt: { $gt: new Date() }
  });
};

// Static method to mark as read
notificationSchema.statics.markAsRead = function(notificationId, userId) {
  return this.findOneAndUpdate(
    { _id: notificationId, user: userId },
    {
      status: 'read',
      readAt: new Date()
    },
    { new: true }
  );
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { user: userId, status: { $ne: 'read' } },
    {
      status: 'read',
      readAt: new Date()
    }
  );
};

// Method to update delivery status
notificationSchema.methods.updateDeliveryStatus = function(channel, status, error = null) {
  if (!this.deliveryStatus[channel]) return;

  this.deliveryStatus[channel].sent = status === 'sent';
  this.deliveryStatus[channel].delivered = status === 'delivered';
  this.deliveryStatus[channel].failed = status === 'failed';

  if (error) {
    this.deliveryStatus[channel].error = error;
  }

  // Update overall status
  if (status === 'delivered' && this.channels.every(ch => this.deliveryStatus[ch].delivered)) {
    this.status = 'delivered';
  } else if (status === 'failed' && this.channels.some(ch => this.deliveryStatus[ch].failed)) {
    this.status = 'failed';
  }

  return this.save();
};

// Method to send notification (placeholder for actual sending logic)
notificationSchema.methods.send = async function() {
  try {
    // This would integrate with actual notification services
    // For now, just mark as sent
    this.status = 'sent';
    this.sentAt = new Date();

    // Update delivery status for each channel
    this.channels.forEach(channel => {
      this.deliveryStatus[channel].sent = true;
    });

    await this.save();
    return true;
  } catch (error) {
    this.status = 'failed';
    await this.save();
    throw error;
  }
};

module.exports = mongoose.model('Notification', notificationSchema);