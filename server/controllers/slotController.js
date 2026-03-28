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

module.exports = {
  getSlots,
  getSlot,
  createSlot,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  getSlotStats,
  scheduleMaintenance,
};
