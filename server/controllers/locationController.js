const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Location = require('../models/Location');
const City = require('../models/City');
const Pincode = require('../models/Pincode');
const Area = require('../models/Area');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildLocationPopulate = () => [
  {
    path: 'cityId',
    select: 'name state',
  },
  {
    path: 'pincodeId',
    select: 'pincode cityId',
  },
  {
    path: 'areaId',
    select: 'name pincodeId cityId',
  },
];

// @desc    Get all locations
// @route   GET /api/locations
// @access  Private/Admin
const getLocations = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.cityId) {
    query.cityId = req.query.cityId;
  }

  if (req.query.pincodeId) {
    query.pincodeId = req.query.pincodeId;
  }

  if (req.query.areaId) {
    query.areaId = req.query.areaId;
  }

  const locations = await Location.find(query).populate(buildLocationPopulate()).sort({ createdAt: -1 });

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
  const location = await Location.findById(req.params.id).populate(buildLocationPopulate());

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((item) => item.msg).join(', '));
  }

  const { cityId, pincodeId, areaId, name, lat, lng, status } = req.body;

  if (!cityId || !pincodeId || !areaId || !name || lat === undefined || lng === undefined) {
    res.status(400);
    throw new Error('Please provide cityId, pincodeId, areaId, name, lat, and lng');
  }

  const [city, pincode, area] = await Promise.all([
    City.findById(cityId),
    Pincode.findOne({ _id: pincodeId, cityId }),
    Area.findOne({ _id: areaId, pincodeId, cityId }),
  ]);

  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  if (!pincode) {
    res.status(404);
    throw new Error('Pincode not found for the selected city');
  }

  if (!area) {
    res.status(404);
    throw new Error('Area not found for the selected pincode');
  }

  const trimmedName = String(name).trim();
  const existingLocation = await Location.findOne({
    cityId,
    pincodeId,
    areaId,
    name: new RegExp(`^${escapeRegExp(trimmedName)}$`, 'i'),
  });

  if (existingLocation) {
    res.status(400);
    throw new Error('Location already exists for the selected area');
  }

  const location = await Location.create({
    cityId,
    pincodeId,
    areaId,
    name: trimmedName,
    lat: Number(lat),
    lng: Number(lng),
    status: status !== undefined ? Boolean(status) : true,
  });

  res.status(201).json({
    success: true,
    message: 'Location created successfully',
    data: await location.populate(buildLocationPopulate()),
  });
});

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private/Admin
const updateLocation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((item) => item.msg).join(', '));
  }

  const location = await Location.findById(req.params.id);

  if (!location) {
    res.status(404);
    throw new Error('Location not found');
  }

  const { cityId, pincodeId, areaId, name, lat, lng, status } = req.body;
  const nextCityId = cityId !== undefined ? cityId : location.cityId;
  const nextPincodeId = pincodeId !== undefined ? pincodeId : location.pincodeId;
  const nextAreaId = areaId !== undefined ? areaId : location.areaId;
  const nextName = name !== undefined ? String(name).trim() : location.name;

  const [city, pincode, area] = await Promise.all([
    City.findById(nextCityId),
    Pincode.findOne({ _id: nextPincodeId, cityId: nextCityId }),
    Area.findOne({ _id: nextAreaId, pincodeId: nextPincodeId, cityId: nextCityId }),
  ]);

  if (!city) {
    res.status(404);
    throw new Error('City not found');
  }

  if (!pincode) {
    res.status(404);
    throw new Error('Pincode not found for the selected city');
  }

  if (!area) {
    res.status(404);
    throw new Error('Area not found for the selected pincode');
  }

  const duplicateLocation = await Location.findOne({
    _id: { $ne: location._id },
    cityId: nextCityId,
    pincodeId: nextPincodeId,
    areaId: nextAreaId,
    name: new RegExp(`^${escapeRegExp(nextName)}$`, 'i'),
  });

  if (duplicateLocation) {
    res.status(400);
    throw new Error('Another location already exists for the selected area');
  }

  location.cityId = nextCityId;
  location.pincodeId = nextPincodeId;
  location.areaId = nextAreaId;
  location.name = nextName;
  location.lat = lat !== undefined ? Number(lat) : location.lat;
  location.lng = lng !== undefined ? Number(lng) : location.lng;
  location.status = status !== undefined ? Boolean(status) : location.status;

  const updatedLocation = await location.save();

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    data: await updatedLocation.populate(buildLocationPopulate()),
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
