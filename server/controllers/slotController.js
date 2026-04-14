const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const ParkingSlot = require('../models/ParkingSlot');
const Location = require('../models/Location');

// @desc    Get all parking slots
// @route   GET /api/slots
// @access  Public
const getSlots = asyncHandler(async (req, res) => {
  try {
    const slots = await ParkingSlot.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        slots,
      },
    });
  } catch (error) {
    console.error('GET /api/slots error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving parking slots',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

// @desc    Get single slot
// @route   GET /api/slots/:id
// @access  Public
const getSlot = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.findById(req.params.id);

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  res.status(200).json({
    success: true,
    data: slot,
  });
});

// @desc    Create slot
// @route   POST /api/slots
// @access  Private/Admin
const createSlot = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const {
    locationId,
    city,
    pincode,
    area,
    location,
    landmark,
    vehicleType,
    slotType,
    slotLocation,
    price,
  } = req.body;

  if (
    !locationId ||
    !city ||
    !pincode ||
    !area ||
    !location ||
    !landmark ||
    !vehicleType ||
    !slotType ||
    !slotLocation ||
    price === undefined ||
    price === null ||
    price === ''
  ) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const linkedLocation = await Location.findById(locationId);
  if (!linkedLocation) {
    res.status(404);
    throw new Error('Linked location not found');
  }

  const slot = await ParkingSlot.create({
    locationId,
    city: String(city).trim(),
    pincode: String(pincode).trim(),
    area: String(area).trim(),
    location: String(location).trim(),
    landmark: String(landmark).trim(),
    vehicleType: String(vehicleType).trim(),
    slotType: String(slotType).trim(),
    slotLocation: String(slotLocation).trim(),
    slotNumber: String(slotLocation).trim(),
    supportedVehicleTypes: [String(vehicleType).trim()],
    price: Number(price),
    isActive: true,
    status: 'available',
  });

  res.status(201).json({
    success: true,
    message: 'Slot created successfully',
    data: slot,
  });
});

// @desc    Update slot
// @route   PUT /api/slots/:id
// @access  Private/Admin
const updateSlot = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const slot = await ParkingSlot.findById(req.params.id);

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  const {
    locationId,
    city,
    pincode,
    area,
    location,
    landmark,
    vehicleType,
    slotType,
    slotLocation,
    price,
  } = req.body;

  if (locationId) {
    const linkedLocation = await Location.findById(locationId);
    if (!linkedLocation) {
      res.status(404);
      throw new Error('Linked location not found');
    }
    slot.locationId = locationId;
  }
  slot.city = city !== undefined ? String(city).trim() : slot.city;
  slot.pincode = pincode !== undefined ? String(pincode).trim() : slot.pincode;
  slot.area = area !== undefined ? String(area).trim() : slot.area;
  slot.location = location !== undefined ? String(location).trim() : slot.location;
  slot.landmark = landmark !== undefined ? String(landmark).trim() : slot.landmark;
  slot.vehicleType = vehicleType !== undefined ? String(vehicleType).trim() : slot.vehicleType;
  if (vehicleType !== undefined) {
    slot.supportedVehicleTypes = [String(vehicleType).trim()];
  }
  slot.slotType = slotType !== undefined ? String(slotType).trim() : slot.slotType;
  slot.slotLocation = slotLocation !== undefined ? String(slotLocation).trim() : slot.slotLocation;
  if (slotLocation !== undefined) {
    slot.slotNumber = String(slotLocation).trim();
  }
  slot.price = price !== undefined ? Number(price) : slot.price;
  slot.isActive = slot.isActive !== false;
  slot.status = slot.status || 'available';

  const updatedSlot = await slot.save();

  res.status(200).json({
    success: true,
    message: 'Slot updated successfully',
    data: updatedSlot,
  });
});

// @desc    Delete slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.findById(req.params.id);

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  await ParkingSlot.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Slot deleted successfully',
  });
});

// @desc    Get available slots
// @route   GET /api/slots/available
// @access  Public
const getAvailableSlots = asyncHandler(async (req, res) => {
  const slots = await ParkingSlot.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      slots,
    },
  });
});

// @desc    Get slot stats
// @route   GET /api/slots/:id/stats
// @access  Private/Admin
const getSlotStats = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.findById(req.params.id);

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  res.status(200).json({
    success: true,
    data: {
      slotId: slot._id,
      totalBookings: 0,
      revenue: 0,
    },
  });
});

// @desc    Schedule maintenance
// @route   POST /api/slots/:id/maintenance
// @access  Private/Admin
const scheduleMaintenance = asyncHandler(async (req, res) => {
  const slot = await ParkingSlot.findById(req.params.id);

  if (!slot) {
    res.status(404);
    throw new Error('Parking slot not found');
  }

  res.status(200).json({
    success: true,
    message: 'Maintenance scheduled successfully',
  });
});

// @desc    Create bulk slots with pattern (e.g., A1-A300, D1-D300)
// @route   POST /api/slots/bulk
// @access  Private/Admin
const createBulkSlots = asyncHandler(async (req, res) => {
  const {
    locationId,
    city,
    pincode,
    area,
    location,
    landmark,
    vehicleType,
    slotType,
    floorPrefix, // legacy: single prefix (e.g., "A")
    startNumber, // legacy
    endNumber, // legacy
    prefixes, // array or comma-separated string: ["A","D"] or "A,D"
    prefixFrom, // e.g., "A"
    prefixTo, // e.g., "Z"
    numberFrom, // e.g., 1
    numberTo, // e.g., 300
    floor, // optional floor number (default 1)
    price,
  } = req.body;

  const normalizeText = (value) => String(value || '').trim();
  const normalizePrefix = (value) => normalizeText(value).toUpperCase();
  const isSingleLetter = (value) => /^[A-Z]$/.test(value);

  // Validate required fields
  if (
    !locationId ||
    !city ||
    !pincode ||
    !area ||
    !location ||
    !landmark ||
    !vehicleType ||
    !slotType ||
    price === undefined ||
    price === null ||
    price === ''
  ) {
    return res.status(400).json({
      success: false,
      message: 'Please fill all required fields',
    });
  }

  const linkedLocation = await Location.findById(locationId);
  if (!linkedLocation) {
    return res.status(404).json({
      success: false,
      message: 'Linked location not found',
    });
  }

  const resolvedVehicleType = normalizeText(vehicleType).toLowerCase();
  if (!['car', 'bike'].includes(resolvedVehicleType)) {
    return res.status(400).json({
      success: false,
      message: 'Vehicle type must be car or bike',
    });
  }

  const resolvedSlotType = normalizeText(slotType).toLowerCase();
  if (!['normal', 'ev', 'disabled', 'reserved'].includes(resolvedSlotType)) {
    return res.status(400).json({
      success: false,
      message: 'Slot type must be normal, ev, disabled, or reserved',
    });
  }

  const start = parseInt(numberFrom ?? startNumber, 10);
  const end = parseInt(numberTo ?? endNumber, 10);

  if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end <= 0 || start > end) {
    return res.status(400).json({
      success: false,
      message: 'Invalid slot number range. Start must be <= End and both must be >= 1.',
    });
  }

  const parsePrefixes = () => {
    if (Array.isArray(prefixes) && prefixes.length > 0) {
      return prefixes
        .map((item) => normalizePrefix(item))
        .filter(Boolean);
    }

    if (typeof prefixes === 'string' && prefixes.trim()) {
      return prefixes
        .split(/[,;\s]+/)
        .map((item) => normalizePrefix(item))
        .filter(Boolean);
    }

    const from = normalizePrefix(prefixFrom);
    const to = normalizePrefix(prefixTo);
    if (from && to) {
      if (!isSingleLetter(from) || !isSingleLetter(to)) {
        return null;
      }

      const fromCode = from.charCodeAt(0);
      const toCode = to.charCodeAt(0);
      if (fromCode > toCode) {
        return null;
      }

      const generated = [];
      for (let code = fromCode; code <= toCode; code += 1) {
        generated.push(String.fromCharCode(code));
      }
      return generated;
    }

    const legacy = normalizePrefix(floorPrefix);
    if (legacy) return [legacy];

    return null;
  };

  const prefixListRaw = parsePrefixes();
  if (!prefixListRaw || prefixListRaw.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Provide prefixes (list), prefixFrom/prefixTo (range), or floorPrefix (single prefix).',
    });
  }

  const prefixList = Array.from(new Set(prefixListRaw));
  const resolvedFloor = Number.isFinite(Number(floor)) && Number(floor) > 0 ? Number(floor) : 1;

  const requestedCount = prefixList.length * (end - start + 1);
  const MAX_BULK_SLOTS = 10000;
  if (requestedCount > MAX_BULK_SLOTS) {
    return res.status(400).json({
      success: false,
      message: `Cannot create more than ${MAX_BULK_SLOTS} slots at once. Please split into multiple requests.`,
    });
  }

  const slotNumbers = [];
  prefixList.forEach((prefix) => {
    for (let i = start; i <= end; i += 1) {
      slotNumbers.push(`${prefix}${i}`);
    }
  });

  const existingSlots = await ParkingSlot.find({
    locationId,
    vehicleType: resolvedVehicleType,
    slotNumber: { $in: slotNumbers },
  })
    .select('slotNumber')
    .lean();

  const existingSet = new Set(existingSlots.map((slot) => String(slot.slotNumber || '').toUpperCase()));

  const slotsToCreate = [];
  prefixList.forEach((prefix) => {
    const derivedRow = isSingleLetter(prefix) ? prefix.charCodeAt(0) - 64 : 1; // A=1
    for (let i = start; i <= end; i += 1) {
      const slotNumber = `${prefix}${i}`;
      if (existingSet.has(slotNumber.toUpperCase())) continue;

      slotsToCreate.push({
        locationId,
        city: normalizeText(city),
        pincode: normalizeText(pincode),
        area: normalizeText(area),
        location: normalizeText(location),
        landmark: normalizeText(landmark),
        vehicleType: resolvedVehicleType,
        slotType: resolvedSlotType,
        slotLocation: slotNumber,
        slotNumber,
        supportedVehicleTypes: [resolvedVehicleType],
        floor: resolvedFloor,
        row: derivedRow,
        column: i,
        price: Number(price),
        isActive: true,
        status: 'available',
      });
    }
  });

  if (slotsToCreate.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No new slots were created (all requested slots already exist).',
      data: {
        requestedCount,
        createdCount: 0,
        skippedCount: requestedCount,
        prefixes: prefixList,
        range: { start, end },
        floor: resolvedFloor,
        vehicleType: resolvedVehicleType,
        slotType: resolvedSlotType,
      },
    });
  }

  try {
    const createdSlots = await ParkingSlot.insertMany(slotsToCreate, { ordered: false });

    return res.status(201).json({
      success: true,
      message: `${createdSlots.length} slots created successfully`,
      data: {
        requestedCount,
        createdCount: createdSlots.length,
        skippedCount: requestedCount - createdSlots.length,
        prefixes: prefixList,
        range: { start, end },
        floor: resolvedFloor,
        vehicleType: resolvedVehicleType,
        slotType: resolvedSlotType,
      },
    });
  } catch (error) {
    console.error('Create bulk slots error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating bulk slots',
    });
  }
});

module.exports = {
  getSlots,
  getSlot,
  createSlot,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  getSlotStats,
  scheduleMaintenance,
  createBulkSlots,
};
