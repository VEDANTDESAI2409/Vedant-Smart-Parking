const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  pincode: {
    type: String,
    trim: true,
    validate: {
      validator: function(pincode) {
        return !pincode || /^\d{6}$/.test(pincode);
      },
      message: 'Pincode must be 6 digits'
    }
  },
  name: {
    type: String,
    required: [true, 'Area name is required'],
    trim: true,
    maxlength: [100, 'Area name cannot exceed 100 characters']
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Area', areaSchema);
