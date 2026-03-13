const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: [true, 'Slot number is required'],
    unique: true,
    trim: true,
    maxlength: [20, 'Slot number cannot exceed 20 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true,
    maxlength: [50, 'Area cannot exceed 50 characters']
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required'],
    min: [-2, 'Floor cannot be lower than -2'],
    max: [50, 'Floor cannot be higher than 50']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    maxlength: [20, 'Section cannot exceed 20 characters']
  },
  slotType: {
    type: String,
    required: [true, 'Slot type is required'],
    enum: ['standard', 'premium', 'disabled', 'electric', 'covered'],
    default: 'standard'
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['car', 'motorcycle', 'truck', 'van', 'suv', 'any'],
    default: 'any'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved', 'blocked'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },
  dailyRate: {
    type: Number,
    required: [true, 'Daily rate is required'],
    min: [0, 'Daily rate cannot be negative']
  },
  monthlyRate: {
    type: Number,
    default: null,
    min: [0, 'Monthly rate cannot be negative']
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  features: [{
    type: String,
    enum: ['covered', 'security_camera', 'lighting', 'ev_charging', 'valet']
  }],
  maintenanceSchedule: [{
    startDate: Date,
    endDate: Date,
    reason: String,
    technician: String
  }],
  occupancyStats: {
    totalBookings: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    lastOccupied: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current booking
parkingSlotSchema.virtual('currentBooking', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'parkingSlot',
  justOne: true,
  match: { status: { $in: ['active', 'reserved'] } }
});

// Virtual for all bookings
parkingSlotSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'parkingSlot'
});

// Index for better query performance
parkingSlotSchema.index({ location: 1, area: 1 });
parkingSlotSchema.index({ status: 1 });
parkingSlotSchema.index({ slotType: 1 });
parkingSlotSchema.index({ vehicleType: 1 });
parkingSlotSchema.index({ 'coordinates': '2dsphere' }); // For geospatial queries

// Static method to find available slots
parkingSlotSchema.statics.findAvailableSlots = function(filters = {}) {
  const query = {
    status: 'available',
    isActive: true,
    ...filters
  };

  // Exclude slots under maintenance
  const now = new Date();
  query.$nor = [
    {
      maintenanceSchedule: {
        $elemMatch: {
          startDate: { $lte: now },
          endDate: { $gte: now }
        }
      }
    }
  ];

  return this.find(query);
};

// Method to check if slot is available for booking
parkingSlotSchema.methods.isAvailableForBooking = function(startTime, endTime) {
  if (this.status !== 'available' || !this.isActive) return false;

  // Check maintenance schedule
  const now = new Date();
  const maintenanceConflict = this.maintenanceSchedule.some(schedule =>
    schedule.startDate <= endTime && schedule.endDate >= startTime
  );

  return !maintenanceConflict;
};

// Method to calculate rate based on duration
parkingSlotSchema.methods.calculateRate = function(durationHours) {
  if (durationHours <= 24) {
    return this.hourlyRate * durationHours;
  } else if (durationHours <= 720) { // 30 days
    return this.dailyRate * Math.ceil(durationHours / 24);
  } else {
    // Monthly rate if available, otherwise daily
    return this.monthlyRate || (this.dailyRate * Math.ceil(durationHours / 24));
  }
};

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);