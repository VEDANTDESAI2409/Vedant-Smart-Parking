const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all vehicles for a user
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter - for admin, get all vehicles; for user, get only their vehicles
    const filter = req.user.role === 'admin' || req.user.role === 'superadmin'
      ? { isActive: true }
      : { owner: req.user.id, isActive: true };

    if (req.query.vehicleType) {
      filter.vehicleType = req.query.vehicleType;
    }
    if (req.query.search) {
      filter.$or = [
        { licensePlate: { $regex: req.query.search, $options: 'i' } },
        { make: { $regex: req.query.search, $options: 'i' } },
        { model: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const vehicles = await Vehicle.find(filter)
      .populate('owner', 'name email phone')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Vehicle.countDocuments(filter);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicles'
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private/Owner
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isActive: true
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: { vehicle }
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicle'
    });
  }
};

// @desc    Create vehicle
// @route   POST /api/vehicles
// @access  Private
exports.createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if license plate already exists
    const existingVehicle = await Vehicle.findOne({
      licensePlate: req.body.licensePlate.toUpperCase(),
      isActive: true
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this license plate already exists'
      });
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      owner: req.user.id,
      licensePlate: req.body.licensePlate.toUpperCase()
    });

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'user_vehicle_added',
      resource: 'vehicle',
      resourceId: vehicle._id,
      description: `Vehicle added: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating vehicle'
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Owner
exports.updateVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'user_vehicle_updated',
      resource: 'vehicle',
      resourceId: vehicle._id,
      description: `Vehicle updated: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
      details: req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vehicle'
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Owner
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isActive: true
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle has active bookings
    const activeBookings = await mongoose.model('Booking').countDocuments({
      vehicle: req.params.id,
      status: { $in: ['confirmed', 'active'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle with active bookings'
      });
    }

    // Soft delete
    vehicle.isActive = false;
    await vehicle.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'user_vehicle_deleted',
      resource: 'vehicle',
      resourceId: vehicle._id,
      description: `Vehicle deleted: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting vehicle'
    });
  }
};

// @desc    Set default vehicle
// @route   PUT /api/vehicles/:id/default
// @access  Private/Owner
exports.setDefaultVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isActive: true
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // The pre-save middleware in the model will handle removing default from other vehicles
    vehicle.isDefault = true;
    await vehicle.save();

    res.json({
      success: true,
      message: 'Default vehicle set successfully',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Set default vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error setting default vehicle'
    });
  }
};