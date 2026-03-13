const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const Vehicle = require('../models/Vehicle');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin or Own Bookings
exports.getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // If not admin, only show user's own bookings
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    } else {
      // Admin filters
      if (req.query.user) {
        filter.user = req.query.user;
      }
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.parkingSlot) {
      filter.parkingSlot = req.query.parkingSlot;
    }
    if (req.query.vehicle) {
      filter.vehicle = req.query.vehicle;
    }
    if (req.query.bookingType) {
      filter.bookingType = req.query.bookingType;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.startTime = {};
      if (req.query.startDate) {
        filter.startTime.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.startTime.$lte = new Date(req.query.endDate);
      }
    }

    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('parkingSlot', 'slotNumber location area')
      .populate('vehicle', 'licensePlate make model')
      .populate('payment', 'status amount paymentMethod')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving bookings'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private/Admin or Booking Owner
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('parkingSlot')
      .populate('vehicle')
      .populate('payment')
      .populate('cancellation.cancelledBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can access this booking
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving booking'
    });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      parkingSlot,
      vehicle,
      startTime,
      endTime,
      bookingType,
      specialRequests
    } = req.body;

    // Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      return res.status(400).json({
        success: false,
        message: 'Start time must be in the future'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Check if parking slot exists and is available
    const slot = await ParkingSlot.findById(parkingSlot);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    if (!slot.isActive || slot.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Parking slot is not available'
      });
    }

    // Check if vehicle exists and belongs to user
    const userVehicle = await Vehicle.findOne({
      _id: vehicle,
      owner: req.user.id,
      isActive: true
    });

    if (!userVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or not accessible'
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.findConflictingBookings(
      parkingSlot,
      start,
      end
    );

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Parking slot is not available for the selected time period'
      });
    }

    // Calculate duration and pricing
    const durationHours = Math.ceil((end - start) / (1000 * 60 * 60));
    const hourlyRate = slot.hourlyRate;
    const dailyRate = slot.dailyRate;

    let totalAmount = 0;
    if (bookingType === 'hourly') {
      totalAmount = hourlyRate * durationHours;
    } else if (bookingType === 'daily') {
      totalAmount = dailyRate * Math.ceil(durationHours / 24);
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      parkingSlot,
      vehicle,
      startTime: start,
      endTime: end,
      duration: durationHours,
      bookingType,
      pricing: {
        hourlyRate,
        dailyRate,
        totalAmount,
        finalAmount: totalAmount // Will be updated if payment processing adds fees
      },
      specialRequests
    });

    // Populate the created booking
    await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'parkingSlot', select: 'slotNumber location area' },
      { path: 'vehicle', select: 'licensePlate make model' }
    ]);

    // Create notification
    await Notification.createNotification(
      req.user.id,
      'booking_confirmed',
      'Booking Confirmed',
      `Your booking for slot ${slot.slotNumber} has been confirmed.`,
      {
        bookingId: booking._id,
        slotNumber: slot.slotNumber,
        startTime: start,
        endTime: end
      }
    );

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'booking_created',
      resource: 'booking',
      resourceId: booking._id,
      description: `New booking created: ${booking.bookingReference}`,
      details: {
        slotNumber: slot.slotNumber,
        startTime: start,
        endTime: end,
        amount: totalAmount
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating booking'
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private/Admin or Booking Owner
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can update this booking
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Only allow updates for pending bookings
    if (booking.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update booking that is already confirmed or active'
      });
    }

    const { specialRequests } = req.body;
    const updateData = {};

    if (specialRequests !== undefined) {
      updateData.specialRequests = specialRequests;
    }

    // Admin can update status
    if (req.user.role === 'admin' && req.body.status) {
      updateData.status = req.body.status;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'user', select: 'name email phone' },
      { path: 'parkingSlot', select: 'slotNumber location area' },
      { path: 'vehicle', select: 'licensePlate make model' }
    ]);

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      admin: req.user.role === 'admin' ? req.user.id : null,
      action: 'booking_updated',
      resource: 'booking',
      resourceId: booking._id,
      description: `Booking updated: ${booking.bookingReference}`,
      details: updateData,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating booking'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/Admin or Booking Owner
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }

    const reason = req.body.reason || (req.user.role === 'admin' ? 'admin_cancelled' : 'user_cancelled');

    await booking.cancelBooking(req.user.id, reason);

    // Create notification
    await Notification.createNotification(
      booking.user.toString(),
      'booking_cancelled',
      'Booking Cancelled',
      `Your booking ${booking.bookingReference} has been cancelled.`,
      {
        bookingId: booking._id,
        reason
      }
    );

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      admin: req.user.role === 'admin' ? req.user.id : null,
      action: 'booking_cancelled',
      resource: 'booking',
      resourceId: booking._id,
      description: `Booking cancelled: ${booking.bookingReference}`,
      details: { reason },
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling booking'
    });
  }
};

// @desc    Extend booking
// @route   PUT /api/bookings/:id/extend
// @access  Private/Admin or Booking Owner
exports.extendBooking = async (req, res) => {
  try {
    const { additionalHours } = req.body;

    if (!additionalHours || additionalHours < 0.5) {
      return res.status(400).json({
        success: false,
        message: 'Additional hours must be at least 0.5'
      });
    }

    const booking = await Booking.findById(req.params.id).populate('parkingSlot');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can extend this booking
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking is active
    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active bookings can be extended'
      });
    }

    // Check if extension conflicts with other bookings
    const newEndTime = new Date(booking.endTime.getTime() + (additionalHours * 60 * 60 * 1000));
    const conflictingBookings = await Booking.findConflictingBookings(
      booking.parkingSlot._id,
      booking.endTime,
      newEndTime,
      booking._id
    );

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot extend booking due to conflicting reservations'
      });
    }

    // Calculate additional cost
    const additionalRate = booking.parkingSlot.hourlyRate;
    const additionalAmount = additionalHours * additionalRate;

    await booking.extendBooking(additionalHours, additionalRate);

    // Create notification
    await Notification.createNotification(
      booking.user.toString(),
      'booking_extended',
      'Booking Extended',
      `Your booking ${booking.bookingReference} has been extended by ${additionalHours} hours.`,
      {
        bookingId: booking._id,
        additionalHours,
        additionalAmount,
        newEndTime
      }
    );

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      admin: req.user.role === 'admin' ? req.user.id : null,
      action: 'booking_extended',
      resource: 'booking',
      resourceId: booking._id,
      description: `Booking extended: ${booking.bookingReference}`,
      details: { additionalHours, additionalAmount },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Booking extended successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Extend booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error extending booking'
    });
  }
};

// @desc    Check-in to booking
// @route   POST /api/bookings/:id/checkin
// @access  Private/Booking Owner
exports.checkInBooking = async (req, res) => {
  try {
    const { checkInCode } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be confirmed to check in'
      });
    }

    // Verify check-in code
    if (booking.checkInCode !== checkInCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in code'
      });
    }

    // Update booking status
    booking.status = 'active';
    booking.actualStartTime = new Date();
    await booking.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'booking_check_in',
      resource: 'booking',
      resourceId: booking._id,
      description: `Checked in to booking: ${booking.bookingReference}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Check-in successful',
      data: { booking }
    });
  } catch (error) {
    console.error('Check-in booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-in'
    });
  }
};

// @desc    Check-out from booking
// @route   POST /api/bookings/:id/checkout
// @access  Private/Booking Owner
exports.checkOutBooking = async (req, res) => {
  try {
    const { checkOutCode } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking is active
    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be active to check out'
      });
    }

    // Verify check-out code
    if (booking.checkOutCode !== checkOutCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-out code'
      });
    }

    // Update booking status
    booking.status = 'completed';
    booking.actualEndTime = new Date();
    await booking.save();

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'booking_check_out',
      resource: 'booking',
      resourceId: booking._id,
      description: `Checked out from booking: ${booking.bookingReference}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Check-out successful',
      data: { booking }
    });
  } catch (error) {
    console.error('Check-out booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-out'
    });
  }
};