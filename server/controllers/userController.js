const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Build sort object
    const sort = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('vehicles', 'licensePlate make model isDefault')
      .populate('bookings', 'bookingReference status startTime endTime', null, {
        sort: { createdAt: -1 },
        limit: 3
      });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving users'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin or Own Profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('vehicles')
      .populate('bookings', null, null, { sort: { createdAt: -1 } })
      .populate('payments', null, null, { sort: { createdAt: -1 } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can access this profile
    if (!['admin', 'superadmin'].includes(req.user.role) && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user'
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Own Profile
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user can update this profile
    if (!['admin', 'superadmin'].includes(req.user.role) && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { name, phone, address, isActive, preferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (preferences) updateData.preferences = preferences;

    // Only admin can change isActive status
    if (req.user.role === 'admin' && isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log activity
    await ActivityLog.logActivity({
      user: req.user.id,
      admin: req.user.role === 'admin' ? req.user.id : null,
      action: req.user.role === 'admin' ? 'user_profile_updated' : 'user_profile_updated',
      resource: 'user',
      resourceId: user._id,
      description: `User profile updated: ${user.name}`,
      details: { updatedFields: Object.keys(updateData) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has active bookings
    const activeBookings = await Booking.countDocuments({
      user: req.params.id,
      status: { $in: ['confirmed', 'active'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active bookings'
      });
    }

    // Soft delete by deactivating
    user.isActive = false;
    await user.save();

    // Log activity
    await ActivityLog.logActivity({
      admin: req.user.id,
      action: 'user_suspended',
      resource: 'user',
      resourceId: user._id,
      description: `User deactivated: ${user.name}`,
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private/Admin or Own Profile
exports.getUserStats = async (req, res) => {
  try {
    // Check if user can access this data
    if (!['admin', 'superadmin'].includes(req.user.role) && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const userId = req.params.id;

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
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
          totalSpent: { $sum: '$pricing.finalAmount' }
        }
      }
    ]);

    // Get payment statistics
    const paymentStats = await Payment.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          successfulPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          totalPaid: { $sum: '$amount' },
          totalRefunded: { $sum: '$totalRefunded' }
        }
      }
    ]);

    // Get vehicle count
    const vehicleCount = await Vehicle.countDocuments({ owner: userId });

    const stats = {
      bookings: bookingStats[0] || {
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalSpent: 0
      },
      payments: paymentStats[0] || {
        totalPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        totalPaid: 0,
        totalRefunded: 0
      },
      vehicles: vehicleCount
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user statistics'
    });
  }
};

// @desc    Get user activity log
// @route   GET /api/users/:id/activity
// @access  Private/Admin
exports.getUserActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await ActivityLog.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('user', 'name email')
      .populate('admin', 'name email');

    const total = await ActivityLog.countDocuments({ user: req.params.id });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user activity'
    });
  }
};