const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
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
      enum: ['normal', 'vip', 'reserved'],
    },
    slotLocation: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
