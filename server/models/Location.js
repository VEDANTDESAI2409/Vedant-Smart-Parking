const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      maxlength: [100, 'Location name cannot exceed 100 characters'],
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: [true, 'Area is required'],
    },
    pincodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pincode',
      required: [true, 'Pincode is required'],
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City is required'],
    },
    status: {
      type: Boolean,
      default: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },
    radiusKm: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },
    floors: [
      {
        floorNumber: { type: Number, required: true },
        label: { type: String, required: true, trim: true },
        vehicleTypes: {
          type: [String],
          enum: ['car', 'bike'],
          default: ['car'],
        },
        totalSlots: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

locationSchema.index({ name: 1, areaId: 1, pincodeId: 1, cityId: 1 }, { unique: true });
locationSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model('Location', locationSchema);
