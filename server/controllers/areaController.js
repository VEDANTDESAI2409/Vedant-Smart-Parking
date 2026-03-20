const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Area = require('../models/Area');

// @desc    Get all areas
// @route   GET /api/areas
// @access  Private/Admin
const getAreas = asyncHandler(async (req, res) => {
  const areas = await Area.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      areas,
    },
  });
});

// @desc    Get single area
// @route   GET /api/areas/:id
// @access  Private/Admin
const getArea = asyncHandler(async (req, res) => {
  const area = await Area.findById(req.params.id);

  if (!area) {
    res.status(404);
    throw new Error('Area not found');
  }

  res.status(200).json({
    success: true,
    data: area,
  });
});

// @desc    Create area
// @route   POST /api/areas
// @access  Private/Admin
const createArea = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((item) => item.msg).join(', '));
  }

  const { city, pincode, name, status } = req.body;

  if (!city || !pincode || !name) {
    res.status(400);
    throw new Error('Please provide city, pincode, and area name');
  }

  const area = await Area.create({
    city: String(city).trim(),
    pincode: String(pincode).trim(),
    name: String(name).trim(),
    status: status !== undefined ? Boolean(status) : true,
  });

  res.status(201).json({
    success: true,
    message: 'Area created successfully',
    data: area,
  });
});

// @desc    Update area
// @route   PUT /api/areas/:id
// @access  Private/Admin
const updateArea = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((item) => item.msg).join(', '));
  }

  const area = await Area.findById(req.params.id);

  if (!area) {
    res.status(404);
    throw new Error('Area not found');
  }

  const { city, pincode, name, status } = req.body;

  area.city = city !== undefined ? String(city).trim() : area.city;
  area.pincode = pincode !== undefined ? String(pincode).trim() : area.pincode;
  area.name = name !== undefined ? String(name).trim() : area.name;
  area.status = status !== undefined ? Boolean(status) : area.status;

  const updatedArea = await area.save();

  res.status(200).json({
    success: true,
    message: 'Area updated successfully',
    data: updatedArea,
  });
});

// @desc    Delete area
// @route   DELETE /api/areas/:id
// @access  Private/Admin
const deleteArea = asyncHandler(async (req, res) => {
  const area = await Area.findById(req.params.id);

  if (!area) {
    res.status(404);
    throw new Error('Area not found');
  }

  await Area.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Area deleted successfully',
  });
});

module.exports = {
  getAreas,
  getArea,
  createArea,
  updateArea,
  deleteArea,
};
