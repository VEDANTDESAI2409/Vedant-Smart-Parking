const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Report title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Report type is required'],
    enum: [
      'revenue',
      'occupancy',
      'user_activity',
      'slot_performance',
      'payment_summary',
      'booking_analytics',
      'system_usage',
      'custom'
    ]
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  parameters: {
    dateRange: {
      start: Date,
      end: Date
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    groupBy: {
      type: String,
      enum: ['day', 'week', 'month', 'year', 'slot', 'location', 'user'],
      default: 'day'
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  summary: {
    totalRecords: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    keyMetrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Report must have a generator']
  },
  generatedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  fileUrl: {
    type: String,
    default: null // URL to stored report file (PDF, CSV, etc.)
  },
  fileSize: {
    type: Number,
    default: null // Size in bytes
  },
  format: {
    type: String,
    enum: ['json', 'csv', 'pdf', 'xlsx'],
    default: 'json'
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly'],
      default: null
    },
    nextRun: Date,
    lastRun: Date,
    isActive: { type: Boolean, default: false }
  },
  tags: [{
    type: String,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiry: 1 year from generation
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
  },
  error: {
    message: String,
    stack: String,
    occurredAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for isExpired
reportSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for duration
reportSchema.virtual('duration').get(function() {
  if (!this.generatedAt || !this.completedAt) return null;
  return this.completedAt - this.generatedAt;
});

// Index for better query performance
reportSchema.index({ type: 1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ generatedAt: -1 });
reportSchema.index({ 'schedule.nextRun': 1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
reportSchema.index({ tags: 1 });

// Pre-save middleware
reportSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Static method to create report
reportSchema.statics.createReport = function(data) {
  return this.create({
    title: data.title,
    type: data.type,
    description: data.description,
    parameters: data.parameters,
    generatedBy: data.generatedBy,
    isScheduled: data.isScheduled || false,
    schedule: data.schedule || {},
    tags: data.tags || []
  });
};

// Static method to get reports by type
reportSchema.statics.getReportsByType = function(type, limit = 50, skip = 0) {
  return this.find({ type })
    .sort({ generatedAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('generatedBy', 'name email');
};

// Static method to get scheduled reports
reportSchema.statics.getScheduledReports = function() {
  return this.find({
    isScheduled: true,
    'schedule.isActive': true,
    'schedule.nextRun': { $lte: new Date() }
  });
};

// Static method to update scheduled report next run
reportSchema.methods.updateNextRun = function() {
  if (!this.isScheduled || !this.schedule.isActive) return;

  const now = new Date();
  let nextRun = new Date(now);

  switch (this.schedule.frequency) {
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      nextRun.setMonth(now.getMonth() + 3);
      break;
  }

  this.schedule.nextRun = nextRun;
  this.schedule.lastRun = now;

  return this.save();
};

// Method to update report data
reportSchema.methods.updateData = function(data, summary = null) {
  this.data = { ...this.data, ...data };

  if (summary) {
    this.summary = { ...this.summary, ...summary };
  }

  this.status = 'completed';
  this.generatedAt = new Date();

  return this.save();
};

// Method to mark as failed
reportSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.error = {
    message: error.message,
    stack: error.stack,
    occurredAt: new Date()
  };

  return this.save();
};

// Method to generate sample data (for testing)
reportSchema.methods.generateSampleData = function() {
  // This would contain logic to generate sample report data
  // For now, just return a placeholder
  const sampleData = {
    generatedAt: new Date(),
    records: [],
    summary: {
      totalRecords: 0,
      totalRevenue: 0,
      totalBookings: 0
    }
  };

  return this.updateData(sampleData.data, sampleData.summary);
};

module.exports = mongoose.model('Report', reportSchema);