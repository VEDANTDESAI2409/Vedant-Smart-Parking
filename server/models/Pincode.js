const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      validate: {
        validator: function (pincode) {
          return /^\d{6}$/.test(pincode);
        },
        message: 'Pincode must be 6 digits',
      },
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
  },
  {
    timestamps: true,
  }
);

pincodeSchema.index({ pincode: 1, cityId: 1 }, { unique: true });

module.exports = mongoose.model('Pincode', pincodeSchema);
