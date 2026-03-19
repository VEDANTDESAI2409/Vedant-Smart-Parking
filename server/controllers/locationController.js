const asyncHandler = require('express-async-handler');
const Location = require('../models/Location');

// @desc    Get all locations
// @route   GET /api/locations
// @access  Private/Admin
const getLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      locations,
    },
  });
});

// @desc    Get single location
// @route   GET /api/locations/:id
// @access  Private/Admin
const getLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    res.status(404);
    throw new Error('Location not found');
  }

  res.status(200).json({
    success: true,
    data: location,
  });
});

// @desc    Create location
// @route   POST /api/locations
// @access  Private/Admin
const createLocation = asyncHandler(async (req, res) => {
  const { name, status } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide location name');
  }

  const location = await Location.create({
    name: String(name).trim(),
    status: status !== undefined ? Boolean(status) : true,
  });

  res.status(201).json({
    success: true,
    message: 'Location created successfully',
    data: location,
  });
});

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private/Admin
const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    res.status(404);
    throw new Error('Location not found');
  }

  const { name, status } = req.body;

  location.name = name !== undefined ? String(name).trim() : location.name;
  location.status = status !== undefined ? Boolean(status) : location.status;

  const updatedLocation = await location.save();

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    data: updatedLocation,
  });
});

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    res.status(404);
    throw new Error('Location not found');
  }

  await Location.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Location deleted successfully',
  });
});

module.exports = {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
};