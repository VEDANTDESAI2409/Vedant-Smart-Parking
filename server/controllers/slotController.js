const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all parking slots
// @route   GET /api/slots
// @access  Public
exports.getSlots = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.city) {
      filter.city = { $regex: req.query.city, $options: 'i' };
    }

    if (req.query.area) {
      filter.area = { $regex: req.query.area, $options: 'i' };
    }

    if (req.query.location) {
      filter.$or = [
        { city: { $regex: req.query.location, $options: 'i' } },
        { area: { $regex: req.query.location, $options: 'i' } },
        { landmark: { $regex: req.query.location, $options: 'i' } },
        { slotLocation: { $regex: req.query.location, $options: 'i' } }
      ];
    }

    if (req.query.slotType) {
      filter.slotType = req.query.slotType;
    }

    if (req.query.vehicleType) {
      filter.vehicleType = req.query.vehicleType;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const sort = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const slots = await ParkingSlot.find(filter)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('currentBooking', 'user startTime endTime');

    const total = await ParkingSlot.countDocuments(filter);

    res.json({
      success: true,
      data: {
        slots,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving parking slots'
    });
  }
};

// @desc    Get single parking slot
// @route   GET /api/slots/:id
// @access  Public
exports.getSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id)
      .populate('currentBooking', 'user startTime endTime vehicle')
      .populate('bookings', 'user startTime endTime status', null, {
        sort: { createdAt: -1 },
        limit: 10
      });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    res.json({
      success: true,
      data: { slot }
    });
  } catch (error) {
    console.error('Get slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving parking slot'
    });
  }
};

// @desc    Create parking slot
// @route   POST /api/slots
// @access  Private/Admin
exports.createSlot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const payload = {
      city: req.body.city,
      area: req.body.area,
      pincode: req.body.pincode,
      landmark: req.body.landmark,
      vehicleType: req.body.vehicleType,
      slotType: req.body.slotType,
      slotLocation: req.body.slotLocation,
      price: req.body.price,
      status: req.body.status || 'available',
      isActive: req.body.isActive ?? true
    };

    const slot = await ParkingSlot.create(payload);

    if (req.user?.id) {
      await ActivityLog.logActivity({
        admin: req.user.id,
        action: 'slot_created',
        resource: 'slot',
        resourceId: slot._id,
        description: `New parking slot created: ${slot.slotNumber || slot.slotLocation}`,
        details: {
          city: slot.city,
          area: slot.area,
          landmark: slot.landmark,
          slotType: slot.slotType,
          vehicleType: slot.vehicleType,
          slotLocation: slot.slotLocation
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.status(201).json({
      success: true,
      message: 'Parking slot created successfully',
      data: { slot }
    });
  } catch (error) {
    console.error('Create slot error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate slot detected'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating parking slot'
    });
  }
};

// @desc    Update parking slot
// @route   PUT /api/slots/:id
// @access  Private/Admin
exports.updateSlot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    const allowedUpdates = {
      city: req.body.city,
      area: req.body.area,
      pincode: req.body.pincode,
      landmark: req.body.landmark,
      vehicleType: req.body.vehicleType,
      slotType: req.body.slotType,
      slotLocation: req.body.slotLocation,
      price: req.body.price,
      status: req.body.status,
      isActive: req.body.isActive
    };

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    Object.assign(slot, allowedUpdates);
    await slot.save();

    if (req.user?.id) {
      await ActivityLog.logActivity({
        admin: req.user.id,
        action: 'slot_updated',
        resource: 'slot',
        resourceId: slot._id,
        description: `Parking slot updated: ${slot.slotNumber || slot.slotLocation}`,
        details: allowedUpdates,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({
      success: true,
      message: 'Parking slot updated successfully',
      data: { slot }
    });
  } catch (error) {
    console.error('Update slot error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating parking slot'
    });
  }
};

// @desc    Delete parking slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    const activeBookings = await Booking.countDocuments({
      parkingSlot: req.params.id,
      status: { $in: ['confirmed', 'active'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete slot with active bookings'
      });
    }

    await ParkingSlot.findByIdAndDelete(req.params.id);

    if (req.user?.id) {
      await ActivityLog.logActivity({
        admin: req.user.id,
        action: 'slot_deleted',
        resource: 'slot',
        resourceId: req.params.id,
        description: `Parking slot deleted: ${slot.slotNumber || slot.slotLocation}`,
        severity: 'high',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({
      success: true,
      message: 'Parking slot deleted successfully'
    });
  } catch (error) {
    console.error('Delete slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting parking slot'
    });
  }
};

// @desc    Get available slots
// @route   GET /api/slots/available
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { startTime, endTime, vehicleType, location, area } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const filter = {
      status: 'available',
      isActive: true
    };

    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    if (location) {
      filter.$or = [
        { city: { $regex: location, $options: 'i' } },
        { area: { $regex: location, $options: 'i' } },
        { landmark: { $regex: location, $options: 'i' } },
        { slotLocation: { $regex: location, $options: 'i' } }
      ];
    }

    if (area) {
      filter.area = { $regex: area, $options: 'i' };
    }

    const slots = await ParkingSlot.find(filter).sort({ createdAt: -1 });

    const availableSlots = [];

    for (const slot of slots) {
      const conflictingBookings = await Booking.findConflictingBookings(slot._id, start, end);

      if (conflictingBookings.length === 0 && slot.isAvailableForBooking(start, end)) {
        availableSlots.push(slot);
      }
    }

    res.json({
      success: true,
      data: {
        slots: availableSlots,
        count: availableSlots.length,
        searchCriteria: {
          startTime: start,
          endTime: end,
          vehicleType: vehicleType || null,
          location,
          area
        }
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving available slots'
    });
  }
};

// @desc    Get slot statistics
// @route   GET /api/slots/:id/stats
// @access  Private/Admin
exports.getSlotStats = async (req, res) => {
  try {
    const slotId = req.params.id;

    const bookingStats = await Booking.aggregate([
      { $match: { parkingSlot: new mongoose.Types.ObjectId(slotId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          activeBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$pricing.finalAmount' },
          averageBookingDuration: { $avg: '$duration' }
        }
      }
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookings = await Booking.find({
      parkingSlot: slotId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const totalHours = recentBookings.reduce((sum, booking) => sum + booking.duration, 0);
    const occupancyRate = (totalHours / (30 * 24)) * 100;

    const stats = {
      bookings: bookingStats[0] || {
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        averageBookingDuration: 0
      },
      occupancy: {
        rate: Math.min(occupancyRate, 100),
        totalHours,
        periodDays: 30
      }
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get slot stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving slot statistics'
    });
  }
};

// @desc    Schedule maintenance for slot
// @route   POST /api/slots/:id/maintenance
// @access  Private/Admin
exports.scheduleMaintenance = async (req, res) => {
  try {
    const { startDate, endDate, reason, technician } = req.body;

    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    const activeBookings = await Booking.countDocuments({
      parkingSlot: req.params.id,
      status: { $in: ['confirmed', 'active'] },
      startTime: { $lt: new Date(endDate) },
      endTime: { $gt: new Date(startDate) }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot schedule maintenance with active bookings'
      });
    }

    const maintenance = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      technician
    };

    slot.maintenanceSchedule.push(maintenance);
    slot.status = 'maintenance';
    await slot.save();

    if (req.user?.id) {
      await ActivityLog.logActivity({
        admin: req.user.id,
        action: 'slot_maintenance_scheduled',
        resource: 'slot',
        resourceId: slot._id,
        description: `Maintenance scheduled for slot: ${slot.slotNumber || slot.slotLocation}`,
        details: maintenance,
        severity: 'medium',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({
      success: true,
      message: 'Maintenance scheduled successfully',
      data: { slot }
    });
  } catch (error) {
    console.error('Schedule maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error scheduling maintenance'
    });
  }
};