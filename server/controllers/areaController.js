const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Area = require('../models/Area');
const City = require('../models/City');
const Pincode = require('../models/Pincode');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildAreaPopulate = () => [
  {
    path: 'cityId',
    select: 'name state',
  },
  {
    path: 'pincodeId',
    select: 'pincode cityId',
  },
];

// @desc    Get all areas
// @route   GET /api/areas
// @access  Private/Admin
const getAreas = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.cityId) {
    query.cityId = req.query.cityId;
  }

  if (req.query.pincodeId) {
    query.pincodeId = req.query.pincodeId;
  }

  const areas = await Area.find(query).populate(buildAreaPopulate()).sort({ createdAt: -1 });

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
  const area = await Area.findById(req.params.id).populate(buildAreaPopulate());

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

  const { cityId, pincodeId, name, status } = req.body;

  if (!cityId || !pincodeId || !name) {
    res.status(400);
    throw new Error('Please provide cityId, pincodeId, and area name');
  }

  const [city, pincode] = await Promise.all([
    City.findById(cityId),
    Pincode.findOne({ _id: pincodeId, cityId }),
  ]);

  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  if (!pincode) {
    res.status(404);
    throw new Error('Pincode not found for the selected city');
  }

  const trimmedName = String(name).trim();
  const existingArea = await Area.findOne({
    cityId,
    pincodeId,
    name: new RegExp(`^${escapeRegExp(trimmedName)}$`, 'i'),
  });

  if (existingArea) {
    res.status(400);
    throw new Error('Area already exists for the selected pincode');
  }

  const area = await Area.create({
    cityId,
    pincodeId,
    name: trimmedName,
    status: status !== undefined ? Boolean(status) : true,
  });

  res.status(201).json({
    success: true,
    message: 'Area created successfully',
    data: await area.populate(buildAreaPopulate()),
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

  const { cityId, pincodeId, name, status } = req.body;
  const nextCityId = cityId !== undefined ? cityId : area.cityId;
  const nextPincodeId = pincodeId !== undefined ? pincodeId : area.pincodeId;
  const nextName = name !== undefined ? String(name).trim() : area.name;

  const [city, pincode] = await Promise.all([
    City.findById(nextCityId),
    Pincode.findOne({ _id: nextPincodeId, cityId: nextCityId }),
  ]);

  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  if (!pincode) {
    res.status(404);
    throw new Error('Pincode not found for the selected city');
  }

  const duplicateArea = await Area.findOne({
    _id: { $ne: area._id },
    cityId: nextCityId,
    pincodeId: nextPincodeId,
    name: new RegExp(`^${escapeRegExp(nextName)}$`, 'i'),
  });

  if (duplicateArea) {
    res.status(400);
    throw new Error('Another area already exists for the selected pincode');
  }

  area.cityId = nextCityId;
  area.pincodeId = nextPincodeId;
  area.name = nextName;
  area.status = status !== undefined ? Boolean(status) : area.status;

  const updatedArea = await area.save();

  res.status(200).json({
    success: true,
    message: 'Area updated successfully',
    data: await updatedArea.populate(buildAreaPopulate()),
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
