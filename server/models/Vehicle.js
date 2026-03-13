const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vehicle must belong to a user']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(plate) {
        // Basic validation for license plate format
        return /^[A-Z0-9\s-]{1,15}$/.test(plate);
      },
      message: 'Please enter a valid license plate'
    }
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be at least 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  color: {
    type: String,
    required: [true, 'Vehicle color is required'],
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['car', 'motorcycle', 'truck', 'van', 'suv', 'electric', 'hybrid'],
    default: 'car'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationExpiry: {
    type: Date,
    required: [true, 'Registration expiry date is required']
  },
  insuranceExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for bookings
vehicleSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'vehicle'
});

// Index for better query performance
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ vehicleType: 1 });

// Pre-save middleware to ensure only one default vehicle per user
vehicleSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default flag from other vehicles of this user
    await this.constructor.updateMany(
      { owner: this.owner, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Static method to get default vehicle for a user
vehicleSchema.statics.getDefaultVehicle = function(userId) {
  return this.findOne({ owner: userId, isDefault: true, isActive: true });
};

module.exports = mongoose.model('Vehicle', vehicleSchema);