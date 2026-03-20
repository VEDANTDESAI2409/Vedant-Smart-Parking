const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Pincode = require('../models/Pincode');
const City = require('../models/City');

const buildPincodePopulate = () => ({
  path: 'cityId',
  select: 'name state',
});

// @desc    Get all pincodes
// @route   GET /api/pincodes
// @access  Private/Admin
const getPincodes = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.cityId) {
    query.cityId = req.query.cityId;
  }

  const pincodes = await Pincode.find(query).populate(buildPincodePopulate()).sort({ createdAt: -1 });

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
  const pincode = await Pincode.findById(req.params.id).populate(buildPincodePopulate());

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((item) => item.msg).join(', '));
  }

  const { cityId, pincode, status } = req.body;

  if (!cityId || !pincode) {
    res.status(400);
    throw new Error('Please provide cityId and pincode');
  }

  const city = await City.findById(cityId);

  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  const trimmedPincode = String(pincode).trim();
  const existingPincode = await Pincode.findOne({ cityId, pincode: trimmedPincode });

  if (existingPincode) {
    res.status(400);
    throw new Error('Pincode already exists for the selected city');
  }

  const createdPincode = await Pincode.create({
    cityId,
    pincode: trimmedPincode,
    status: status !== undefined ? Boolean(status) : true,
  });

  res.status(201).json({
    success: true,
    message: 'Pincode created successfully',
    data: await createdPincode.populate(buildPincodePopulate()),
  });
});

// @desc    Update pincode
// @route   PUT /api/pincodes/:id
// @access  Private/Admin
const updatePincode = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((item) => item.msg).join(', '));
  }

  const pincode = await Pincode.findById(req.params.id);

  if (!pincode) {
    res.status(404);
    throw new Error('Pincode not found');
  }

  const { cityId, pincode: pincodeValue, status } = req.body;
  const nextCityId = cityId !== undefined ? cityId : pincode.cityId;
  const nextPincode = pincodeValue !== undefined ? String(pincodeValue).trim() : pincode.pincode;

  const city = await City.findById(nextCityId);
  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  const duplicatePincode = await Pincode.findOne({
    _id: { $ne: pincode._id },
    cityId: nextCityId,
    pincode: nextPincode,
  });

  if (duplicatePincode) {
    res.status(400);
    throw new Error('Another pincode already exists for the selected city');
  }

  pincode.cityId = nextCityId;
  pincode.pincode = nextPincode;
  pincode.status = status !== undefined ? Boolean(status) : pincode.status;

  const updatedPincode = await pincode.save();

  res.status(200).json({
    success: true,
    message: 'Pincode updated successfully',
    data: await updatedPincode.populate(buildPincodePopulate()),
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
