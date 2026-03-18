const asyncHandler = require('express-async-handler');
const Pincode = require('../models/Pincode');

// @desc    Get all pincodes
// @route   GET /api/pincodes
// @access  Private/Admin
const getPincodes = asyncHandler(async (req, res) => {
  const pincodes = await Pincode.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      pincodes,
    },
  });
});

// @desc    Get single pincode
// @route   GET /api/pincodes/:id
// @access  Private/Admin
const getPincode = asyncHandler(async (req, res) => {
  const pincode = await Pincode.findById(req.params.id);

  if (!pincode) {
    res.status(404);
    throw new Error('Pincode not found');
  }

  res.status(200).json({
    success: true,
    data: pincode,
  });
});

// @desc    Create pincode
// @route   POST /api/pincodes
// @access  Private/Admin
const createPincode = asyncHandler(async (req, res) => {
  const { name, status } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide pincode');
  }

  const pincode = await Pincode.create({
    name: String(name).trim(),
    status: status !== undefined ? Boolean(status) : true,
  });

  res.status(201).json({
    success: true,
    message: 'Pincode created successfully',
    data: pincode,
  });
});

// @desc    Update pincode
// @route   PUT /api/pincodes/:id
// @access  Private/Admin
const updatePincode = asyncHandler(async (req, res) => {
  const pincode = await Pincode.findById(req.params.id);

  if (!pincode) {
    res.status(404);
    throw new Error('Pincode not found');
  }

  const { name, status } = req.body;

  pincode.name = name !== undefined ? String(name).trim() : pincode.name;
  pincode.status = status !== undefined ? Boolean(status) : pincode.status;

  const updatedPincode = await pincode.save();

  res.status(200).json({
    success: true,
    message: 'Pincode updated successfully',
    data: updatedPincode,
  });
});

// @desc    Delete pincode
// @route   DELETE /api/pincodes/:id
// @access  Private/Admin
const deletePincode = asyncHandler(async (req, res) => {
  const pincode = await Pincode.findById(req.params.id);

  if (!pincode) {
    res.status(404);
    throw new Error('Pincode not found');
  }

  await Pincode.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Pincode deleted successfully',
  });
});

module.exports = {
  getPincodes,
  getPincode,
  createPincode,
  updatePincode,
  deletePincode,
};