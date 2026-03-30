const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Location = require('../models/Location');
const City = require('../models/City');
const Pincode = require('../models/Pincode');
const Area = require('../models/Area');
const ParkingSlot = require('../models/ParkingSlot');
const { checkConnection } = require('../config/database');
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeText = (value) => String(value || '').trim().toLowerCase();

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

const formatPublicLocation = (location) => ({
  _id: location._id,
  name: location.name,
  lat: location.lat,
  lng: location.lng,
  status: location.status,
  city: location.cityId?.name || '',
  state: location.cityId?.state || '',
  pincode: location.pincodeId?.pincode || '',
  area: location.areaId?.name || '',
  createdAt: location.createdAt,
  updatedAt: location.updatedAt,
});

// @desc    Get public locations for the user map
// @route   GET /api/locations/public
// @access  Public
const getPublicLocations = asyncHandler(async (req, res) => {
  if (!checkConnection()) {
    return res.status(200).json({
      success: true,
      data: {
        locations: [],
      },
      message: 'Database is currently unavailable',
    });
  }

  const query = { status: true };

  const locations = await Location.find(query)
    .populate(buildLocationPopulate())
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      locations: locations.map(formatPublicLocation),
    },
  });
});

// @desc    Get single public location for the user map
// @route   GET /api/locations/public/:id
// @access  Public
const getPublicLocation = asyncHandler(async (req, res) => {
  if (!checkConnection()) {
    res.status(503);
    throw new Error('Database is currently unavailable');
  }

  const location = await Location.findOne({ _id: req.params.id, status: true }).populate(buildLocationPopulate());

  if (!location) {
    res.status(404);
    throw new Error('Location not found');
  }

  res.status(200).json({
    success: true,
    data: formatPublicLocation(location),
  });
});

const calculateDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const releaseExpiredLockIfNeeded = async (slot) => {
  if (slot.lockExpiresAt && slot.lockExpiresAt.getTime() <= Date.now()) {
    slot.lockExpiresAt = null;
    slot.lockedBy = null;
    slot.lockToken = null;
    if (slot.status === 'locked') {
      slot.status = 'available';
    }
    await slot.save();
  }
  return slot;
};

const buildLegacySlotQuery = (location, vehicleType = null) => {
  const query = {
    city: location.cityId?.name || '',
    area: location.areaId?.name || '',
    location: location.name,
    pincode: location.pincodeId?.pincode || '',
    $or: [{ locationId: location._id }, { locationId: null }, { locationId: { $exists: false } }],
    $and: [{ $or: [{ isActive: true }, { isActive: { $exists: false } }] }],
  };

  if (vehicleType) {
    query.$and.push({
      $or: [
        { supportedVehicleTypes: vehicleType },
        { vehicleType },
      ],
    });
  }

  return query;
};

// @desc    Get all locations
// @route   GET /api/locations
// @access  Private/Admin
const getLocations = asyncHandler(async (req, res) => {
  if (!checkConnection()) {
    return res.status(200).json({
      success: true,
      data: {
        locations: [],
      },
      message: 'Database is currently unavailable',
    });
  }

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
  if (!checkConnection()) {
    res.status(503);
    throw new Error('Database is currently unavailable');
  }

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

  if (!cityId || !pincodeId || !areaId || !name) {
    res.status(400);
    throw new Error('Please provide cityId, pincodeId, areaId, and name');
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
    lat: lat === undefined || lat === null || lat === '' ? 0 : Number(lat),
    lng: lng === undefined || lng === null || lng === '' ? 0 : Number(lng),
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
  location.lat = lat !== undefined && lat !== null && lat !== '' ? Number(lat) : location.lat;
  location.lng = lng !== undefined && lng !== null && lng !== '' ? Number(lng) : location.lng;
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
  getPublicLocations,
  getPublicLocation,
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getNearbyLocations: asyncHandler(async (req, res) => {
    if (!checkConnection()) {
      return res.status(200).json({
        success: true,
        data: {
          locations: [],
        },
        message: 'Database is currently unavailable',
      });
    }

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Math.min(Number(req.query.radiusKm) || 10, 25);
    const detectedCity = normalizeText(req.query.city);
    const detectedArea = normalizeText(req.query.area);
    const detectedPincode = normalizeText(req.query.pincode);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      res.status(400);
      throw new Error('Valid lat and lng query params are required');
    }

    const locations = await Location.find({ status: true })
      .populate(buildLocationPopulate())
      .sort({ createdAt: -1 });

    const nearbyLocations = (
      await Promise.all(
        locations.map(async (location) => {
          const locationCity = normalizeText(location.cityId?.name);
          const locationArea = normalizeText(location.areaId?.name);
          const locationPincode = normalizeText(location.pincodeId?.pincode);
          const hasCoordinates =
            typeof location.lat === 'number' &&
            typeof location.lng === 'number' &&
            !(location.lat === 0 && location.lng === 0);
          const distanceKm = hasCoordinates
            ? calculateDistanceKm(lat, lng, location.lat, location.lng)
            : null;
          const pincodeMatch = Boolean(detectedPincode && detectedPincode === locationPincode);
          const areaMatch = Boolean(
            detectedArea &&
              detectedCity &&
              detectedArea === locationArea &&
              detectedCity === locationCity
          );
          const cityMatch = Boolean(detectedCity && detectedCity === locationCity);
          const textualMatch = pincodeMatch || areaMatch || cityMatch;
          const withinRadius = distanceKm !== null && distanceKm <= radiusKm;

          if (!withinRadius && !textualMatch) {
            return null;
          }

          const slots = await ParkingSlot.find(buildLegacySlotQuery(location));

          const activeSlots = await Promise.all(slots.map(releaseExpiredLockIfNeeded));
          const availableSlots = activeSlots.filter(
            (slot) => (slot.status || 'available') === 'available' && (slot.slotType || 'normal') !== 'reserved'
          ).length;

          return {
            id: location._id,
            name: location.name,
            city: location.cityId?.name || '',
            area: location.areaId?.name || '',
            pincode: location.pincodeId?.pincode || '',
            address: location.address || '',
            lat: location.lat,
            lng: location.lng,
            distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)),
            floors: location.floors || [],
            totalSlots: activeSlots.length,
            availableSlots,
            matchType: pincodeMatch ? 'pincode' : areaMatch ? 'area' : cityMatch ? 'city' : 'radius',
          };
        })
      )
    )
      .filter(Boolean)
      .sort((a, b) => {
        const score = { pincode: 0, area: 1, city: 2, radius: 3 };
        const scoreDiff = (score[a.matchType] ?? 99) - (score[b.matchType] ?? 99);
        if (scoreDiff !== 0) return scoreDiff;
        return (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER);
      });

    res.status(200).json({
      success: true,
      data: {
        locations: nearbyLocations,
      },
    });
  }),
  getLocationBlueprint: asyncHandler(async (req, res) => {
    if (!checkConnection()) {
      return res.status(200).json({
        success: true,
        data: {
          location: null,
          floors: [],
          legend: [
            { key: 'normal', label: 'Normal' },
            { key: 'ev', label: 'EV' },
            { key: 'reserved', label: 'Reserved' },
            { key: 'disabled', label: 'Disabled' },
          ],
        },
        message: 'Database is currently unavailable',
      });
    }

    const location = await Location.findById(req.params.id).populate(buildLocationPopulate());

    if (!location) {
      res.status(404);
      throw new Error('Location not found');
    }

    const vehicleType = req.query.vehicleType || 'car';
    const slots = await ParkingSlot.find(buildLegacySlotQuery(location, vehicleType)).sort({
      floor: 1,
      row: 1,
      column: 1,
      slotNumber: 1,
    });

    const preparedSlots = await Promise.all(slots.map(releaseExpiredLockIfNeeded));
    const floorsMap = new Map();

    preparedSlots.forEach((slot) => {
      const floorKey = slot.floor || 1;
      if (!floorsMap.has(floorKey)) {
        floorsMap.set(floorKey, []);
      }

      floorsMap.get(floorKey).push({
        id: slot._id,
        slotNumber: slot.slotNumber || slot.slotLocation,
        slotType: slot.slotType || 'normal',
        status: slot.status || 'available',
        vehicleType: slot.vehicleType,
        supportedVehicleTypes: slot.supportedVehicleTypes,
        row: slot.row,
        column: slot.column,
        price: slot.price,
        hourlyRate: slot.hourlyRate,
        dailyRate: slot.dailyRate,
        isBookable: (slot.slotType || 'normal') !== 'reserved' && (slot.status || 'available') === 'available',
        isLocked: (slot.status || 'available') === 'locked' && !!slot.lockExpiresAt,
        isAccessible: (slot.slotType || 'normal') === 'disabled',
      });
    });

    const floors = Array.from(floorsMap.entries()).map(([floorNumber, floorSlots]) => ({
      floorNumber,
      label:
        location.floors?.find((floor) => floor.floorNumber === floorNumber)?.label ||
        `Floor ${floorNumber}`,
      slots: floorSlots,
    }));

    res.status(200).json({
      success: true,
      data: {
        location: {
          id: location._id,
          name: location.name,
          city: location.cityId?.name || '',
          area: location.areaId?.name || '',
          pincode: location.pincodeId?.pincode || '',
          address: location.address || '',
          lat: location.lat,
          lng: location.lng,
        },
        floors,
        legend: [
          { key: 'normal', label: 'Normal' },
          { key: 'ev', label: 'EV' },
          { key: 'reserved', label: 'Reserved' },
          { key: 'disabled', label: 'Disabled' },
        ],
      },
    });
  }),
};
