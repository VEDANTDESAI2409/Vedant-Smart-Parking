const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const City = require('../models/City');

const normalizeValue = (value) => String(value || '').trim();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((item) => item.msg).join(', '));
  }

  const { name, state, status } = req.body;

  if (!name || !state) {
    res.status(400);
    throw new Error('Please provide city name and state');
  }

  const trimmedName = normalizeValue(name);
  const trimmedState = normalizeValue(state);

  const existingCity = await City.findOne({
    name: new RegExp(`^${escapeRegExp(trimmedName)}$`, 'i'),
    state: new RegExp(`^${escapeRegExp(trimmedState)}$`, 'i'),
  });

  if (existingCity) {
    res.status(400);
    throw new Error('City already exists for the selected state');
  }

  const city = await City.create({
    name: trimmedName,
    state: trimmedState,
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((item) => item.msg).join(', '));
  }

  const city = await City.findById(req.params.id);

  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  const { name, state, status } = req.body;
  const nextName = name !== undefined ? normalizeValue(name) : city.name;
  const nextState = state !== undefined ? normalizeValue(state) : city.state;

  const duplicateCity = await City.findOne({
    _id: { $ne: city._id },
    name: new RegExp(`^${escapeRegExp(nextName)}$`, 'i'),
    state: new RegExp(`^${escapeRegExp(nextState)}$`, 'i'),
  });

  if (duplicateCity) {
    res.status(400);
    throw new Error('Another city already exists with the same name and state');
  }

  city.name = nextName;
  city.state = nextState;
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
