const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: Boolean, default: true }
});

module.exports = mongoose.model('City', citySchema);