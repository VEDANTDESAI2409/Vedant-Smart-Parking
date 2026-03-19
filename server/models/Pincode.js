const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    unique: true,
    validate: {
      validator: function(pincode) {
        return /^\d{6}$/.test(pincode);
      },
      message: 'Pincode must be 6 digits'
    }
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pincode', pincodeSchema);