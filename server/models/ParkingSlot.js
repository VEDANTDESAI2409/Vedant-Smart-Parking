const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      trim: true,
      default: '',
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{6}$/,
    },
    landmark: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ['car', 'bike'],
    },
    slotType: {
      type: String,
      required: true,
      enum: ['normal', 'ev', 'disabled', 'reserved'],
    },
    slotLocation: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: Number,
      default: 1,
      min: 1,
    },
    row: {
      type: Number,
      default: 1,
      min: 1,
    },
    column: {
      type: Number,
      default: 1,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      default: function () {
        return this.price || 0;
      },
      min: 0,
    },
    dailyRate: {
      type: Number,
      default: function () {
        return this.price ? this.price * 8 : 0;
      },
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'locked', 'maintenance'],
      default: 'available',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    supportedVehicleTypes: {
      type: [String],
      enum: ['car', 'bike'],
      default: function () {
        return this.vehicleType ? [this.vehicleType] : ['car'];
      },
    },
    amenities: {
      type: [String],
      default: [],
    },
    lockExpiresAt: {
      type: Date,
      default: null,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockToken: {
      type: String,
      default: null,
    },
    currentBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

parkingSlotSchema.pre('validate', function (next) {
  if (!this.slotNumber) {
    this.slotNumber = this.slotLocation;
  }

  if (!this.hourlyRate && this.price) {
    this.hourlyRate = this.price;
  }

  if (!this.dailyRate && this.price) {
    this.dailyRate = this.price * 8;
  }

  if ((!this.supportedVehicleTypes || this.supportedVehicleTypes.length === 0) && this.vehicleType) {
    this.supportedVehicleTypes = [this.vehicleType];
  }

  next();
});

parkingSlotSchema.methods.releaseLock = function () {
  this.lockExpiresAt = null;
  this.lockedBy = null;
  this.lockToken = null;
  if (this.status === 'locked') {
    this.status = 'available';
  }
  return this.save();
};

parkingSlotSchema.methods.isLockExpired = function () {
  return this.lockExpiresAt && this.lockExpiresAt.getTime() <= Date.now();
};

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
