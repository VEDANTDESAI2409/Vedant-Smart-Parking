const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be null for system activities
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      // User actions
      'user_registered',
      'user_login',
      'user_logout',
      'user_profile_updated',
      'user_password_changed',
      'user_vehicle_added',
      'user_vehicle_updated',
      'user_vehicle_deleted',

      // Booking actions
      'booking_created',
      'booking_confirmed',
      'booking_cancelled',
      'booking_extended',
      'booking_check_in',
      'booking_check_out',
      'booking_completed',
      'booking_no_show',

      // Payment actions
      'payment_initiated',
      'payment_completed',
      'payment_failed',
      'payment_refunded',
      'payment_cancelled',

      // Admin actions
      'admin_login',
      'admin_logout',
      'slot_created',
      'slot_updated',
      'slot_deleted',
      'slot_maintenance_scheduled',
      'user_suspended',
      'user_activated',
      'system_settings_updated',
      'report_generated',

      // System actions
      'system_backup',
      'system_maintenance',
      'api_error',
      'security_alert'
    ]
  },
  resource: {
    type: String,
    enum: ['user', 'admin', 'booking', 'payment', 'vehicle', 'slot', 'notification', 'report', 'system'],
    required: [true, 'Resource type is required']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {} // Store additional context like old values, new values, etc.
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 1 year from creation for regular logs, 5 years for critical
      const expiryDays = this.severity === 'critical' ? 365 * 5 : 365;
      return new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for isExpired
activityLogSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Index for better query performance
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ admin: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ resource: 1, resourceId: 1 });
activityLogSchema.index({ severity: 1 });
activityLogSchema.index({ status: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
activityLogSchema.index({ tags: 1 });

// Static method to log activity
activityLogSchema.statics.logActivity = function(data) {
  return this.create({
    user: data.user || null,
    admin: data.admin || null,
    action: data.action,
    resource: data.resource,
    resourceId: data.resourceId || null,
    description: data.description,
    details: data.details || {},
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
    location: data.location || {},
    severity: data.severity || 'low',
    status: data.status || 'success',
    tags: data.tags || []
  });
};

// Static method to get user activity
activityLogSchema.statics.getUserActivity = function(userId, limit = 50, skip = 0) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'name email')
    .populate('admin', 'name email');
};

// Static method to get admin activity
activityLogSchema.statics.getAdminActivity = function(adminId, limit = 50, skip = 0) {
  return this.find({ admin: adminId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('user', 'name email')
    .populate('admin', 'name email');
};

// Static method to get activity by action
activityLogSchema.statics.getActivityByAction = function(action, dateRange = null, limit = 100) {
  const query = { action };

  if (dateRange) {
    query.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('admin', 'name email');
};

// Static method to get security alerts
activityLogSchema.statics.getSecurityAlerts = function(limit = 50) {
  return this.find({
    severity: { $in: ['high', 'critical'] },
    action: { $in: ['security_alert', 'api_error', 'user_suspended'] }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('admin', 'name email');
};

// Static method to get activity statistics
activityLogSchema.statics.getActivityStats = function(dateRange = null) {
  const matchConditions = {};

  if (dateRange) {
    matchConditions.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    };
  }

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: {
          action: '$action',
          status: '$status',
          severity: '$severity'
        },
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);