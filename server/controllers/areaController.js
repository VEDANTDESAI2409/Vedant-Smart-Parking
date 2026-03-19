const asyncHandler = require('express-async-handler');
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
  const { name, status } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide area name');
  }

  const area = await Area.create({
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
  const area = await Area.findById(req.params.id);

  if (!area) {
    res.status(404);
    throw new Error('Area not found');
  }

  const { name, status } = req.body;

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