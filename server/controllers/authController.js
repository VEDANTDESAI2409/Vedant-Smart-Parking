const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const {
  getDevAdminUser,
  isDevAdminLoginEnabled,
  matchesDevAdminCredentials
} = require('../utils/devAdmin');

// Generate JWT token
const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email or phone number' });
    }
    const user = await User.create({ name, email: email.toLowerCase(), password, phone });
    await ActivityLog.logActivity({
      user: user._id,
      action: 'user_registered',
      resource: 'user',
      resourceId: user._id,
      description: `New user registered: ${user.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }, token }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }
    await user.updateLastLogin();
    await ActivityLog.logActivity({
      user: user._id,
      action: 'user_login',
      resource: 'user',
      resourceId: user._id,
      description: `User logged in: ${user.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, lastLogin: user.lastLogin }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    if (matchesDevAdminCredentials(normalizedEmail, password)) {
      const devAdmin = getDevAdminUser();
      const token = generateToken(devAdmin.id, 'admin');

      return res.json({
        success: true,
        message: 'Development admin login successful',
        token,
        user: devAdmin
      });
    }

    if (mongoose.connection.readyState !== 1 && matchesDevAdminCredentials(normalizedEmail, password)) {
      const devAdmin = getDevAdminUser();
      const token = generateToken(devAdmin.id, 'admin');

      return res.json({
        success: true,
        message: 'Development admin login successful',
        token,
        user: devAdmin
      });
    }

    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password');
    if (!admin || !(await admin.comparePassword(password))) {
      if (matchesDevAdminCredentials(normalizedEmail, password)) {
        const devAdmin = getDevAdminUser();
        const token = generateToken(devAdmin.id, 'admin');

        return res.json({
          success: true,
          message: 'Development admin login successful',
          token,
          user: devAdmin
        });
      }

      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated.' });
    }
    await admin.updateLastLogin();
    await ActivityLog.logActivity({
      admin: admin._id,
      action: 'admin_login',
      resource: 'admin',
      resourceId: admin._id,
      description: `Admin logged in: ${admin.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'medium'
    });
    const token = generateToken(admin._id, 'admin');
    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, permissions: admin.permissions, lastLogin: admin.lastLogin }
    });
  } catch (error) {
    console.error('Admin login error:', error);

    if (matchesDevAdminCredentials(req.body?.email || '', req.body?.password || '') && isDevAdminLoginEnabled()) {
      const devAdmin = getDevAdminUser();
      const token = generateToken(devAdmin.id, 'admin');

      return res.json({
        success: true,
        message: 'Development admin login successful',
        token,
        user: devAdmin
      });
    }

    res.status(500).json({ success: false, message: 'Server error during admin login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      if (req.user.id === getDevAdminUser().id && isDevAdminLoginEnabled()) {
        return res.json({
          success: true,
          data: {
            user: getDevAdminUser()
          }
        });
      }

      const admin = await Admin.findById(req.user.id);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin,
            createdAt: admin.createdAt
          }
        }
      });
    }

    const user = await User.findById(req.user.id)
      .populate('vehicles', 'licensePlate make model isDefault')
      .populate('bookings', 'bookingReference status startTime endTime', null, { sort: { createdAt: -1 }, limit: 5 });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      data: {
        user: {
          id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isActive: user.isActive,
          profileImage: user.profileImage, lastLogin: user.lastLogin, preferences: user.preferences, vehicles: user.vehicles,
          recentBookings: user.bookings, createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { name, phone, preferences } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (preferences) updateData.preferences = preferences;
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await ActivityLog.logActivity({
      user: user._id,
      action: 'user_profile_updated',
      resource: 'user',
      resourceId: user._id,
      description: `User updated profile: ${user.name}`,
      details: { updatedFields: Object.keys(updateData) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: { id: user._id, name: user.name, email: user.email, phone: user.phone, preferences: user.preferences } }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    await ActivityLog.logActivity({
      user: user._id,
      action: 'user_password_changed',
      resource: 'user',
      resourceId: user._id,
      description: `User changed password: ${user.name}`,
      severity: 'medium',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error changing password' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    await ActivityLog.logActivity({
      user: req.user.id,
      action: 'user_logout',
      resource: 'user',
      resourceId: req.user.id,
      description: `User logged out: ${req.user.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
exports.refreshToken = async (req, res) => {
  try {
    const token = generateToken(req.user.id, req.user.role);
    res.json({ success: true, data: { token } });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Server error refreshing token' });
  }
};

// --- NEW FUNCTION ADDED FOR ADMIN PROFILE UPDATE ---

// @desc    Update admin profile & password
// @route   PUT /api/auth/admin/profile
// @access  Private (Admin)
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, avatar, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user.id).select('+password');

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please provide current password to set a new one' });
      }
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      admin.password = newPassword;
    }

    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (phone) admin.phone = phone;
    if (avatar) admin.profileImage = avatar;

    await admin.save();

    await ActivityLog.logActivity({
      admin: admin._id,
      action: 'admin_profile_updated',
      resource: 'admin',
      resourceId: admin._id,
      description: `Admin updated their profile: ${admin.name}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      severity: 'medium'
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, role: admin.role, avatar: admin.profileImage }
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ success: false, message: 'Server error updating admin profile' });
  }
};
