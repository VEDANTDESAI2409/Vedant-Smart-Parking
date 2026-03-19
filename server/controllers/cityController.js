const asyncHandler = require('express-async-handler');
const City = require('../models/City');

// @desc    Get all cities
// @route   GET /api/cities
// @access  Private/Admin
const getCities = asyncHandler(async (req, res) => {
  const cities = await City.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      cities,
    },
  });
});

// @desc    Get single city
// @route   GET /api/cities/:id
// @access  Private/Admin
const getCity = asyncHandler(async (req, res) => {
  const city = await City.findById(req.params.id);

  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  res.status(200).json({
    success: true,
    data: city,
  });
});

// @desc    Create city
// @route   POST /api/cities
// @access  Private/Admin
const createCity = asyncHandler(async (req, res) => {
  const { name, status } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide city name');
  }

  const city = await City.create({
    name: String(name).trim(),
    status: status !== undefined ? Boolean(status) : true,
  });

  res.status(201).json({
    success: true,
    message: 'City created successfully',
    data: city,
  });
});

// @desc    Update city
// @route   PUT /api/cities/:id
// @access  Private/Admin
const updateCity = asyncHandler(async (req, res) => {
  const city = await City.findById(req.params.id);

  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  const { name, status } = req.body;

  city.name = name !== undefined ? String(name).trim() : city.name;
  city.status = status !== undefined ? Boolean(status) : city.status;

  const updatedCity = await city.save();

  res.status(200).json({
    success: true,
    message: 'City updated successfully',
    data: updatedCity,
  });
});

// @desc    Delete city
// @route   DELETE /api/cities/:id
// @access  Private/Admin
const deleteCity = asyncHandler(async (req, res) => {
  const city = await City.findById(req.params.id);

  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  await City.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'City deleted successfully',
  });
});

module.exports = {
  getCities,
  getCity,
  createCity,
  updateCity,
  deleteCity,
};