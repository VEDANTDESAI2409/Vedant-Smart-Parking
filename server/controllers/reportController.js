const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Report = require('../models/Report');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const ParkingSlot = require('../models/ParkingSlot');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const reports = await Report.find(filter)
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving reports'
    });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private/Admin
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving report'
    });
  }
};

// @desc    Create report
// @route   POST /api/reports
// @access  Private/Admin
exports.createReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, type, description, parameters } = req.body;

    const report = await Report.createReport({
      title,
      type,
      description,
      parameters,
      generatedBy: req.user.id
    });

    // Start report generation in background
    generateReport(report._id);

    res.status(201).json({
      success: true,
      message: 'Report generation started',
      data: { report }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating report'
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting report'
    });
  }
};

// @desc    Get dashboard statistics (slots, bookings, users, revenue)
// @route   GET /api/reports/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalSlots,
      occupiedSlots,
      availableSlots,
      totalBookings,
      activeBookings,
      totalUsers,
      totalVehicles,
      revenueData,
      bookingStatusData
    ] = await Promise.all([
      ParkingSlot.countDocuments(),
      ParkingSlot.countDocuments({ status: { $in: ['occupied', 'reserved'] } }),
      ParkingSlot.countDocuments({ status: 'available' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'active' }),
      User.countDocuments(),
      Vehicle.countDocuments(),
      // Revenue by month (last 6 months)
      Payment.aggregate([
        {
          $match: { status: 'completed' }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$amount' }
          }
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            revenue: 1
          }
        },
        {
          $sort: { year: 1, month: 1 }
        }
      ]),
      // Booking status counts
      Booking.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Occupancy data for the last 7 days (based on bookings startTime)
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 6); // include today

    const occupancyResults = await Booking.aggregate([
      {
        $match: {
          startTime: { $gte: startDate },
          status: { $in: ['active', 'completed'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startTime' },
            month: { $month: '$startTime' },
            day: { $dayOfMonth: '$startTime' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const occupancyMap = occupancyResults.reduce((acc, item) => {
      const key = `${item._id.year}-${item._id.month}-${item._id.day}`;
      acc[key] = item.count;
      return acc;
    }, {});

    const occupancyData = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      occupancyData.push({
        time: date.toLocaleDateString('en-US', { weekday: 'short' }),
        occupied: occupancyMap[key] || 0
      });
    }

    // Convert revenue data to month labels
    const monthlyRevenue = revenueData.map((item) => {
      const monthName = new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short' });
      return { month: monthName, revenue: item.revenue };
    });

    const bookingStatusDataFormatted = bookingStatusData.map((item) => {
      return {
        name: item._id,
        value: item.count,
        color: item._id === 'active' ? '#22c55e' : item._id === 'completed' ? '#3b82f6' : '#ef4444'
      };
    });

    res.json({
      success: true,
      data: {
        totalSlots,
        occupiedSlots,
        availableSlots,
        totalBookings,
        activeBookings,
        totalUsers,
        totalVehicles,
        totalRevenue: revenueData.reduce((sum, item) => sum + item.revenue, 0),
        monthlyRevenue,
        occupancyData,
        bookingStatusData: bookingStatusDataFormatted
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard statistics'
    });
  }
};

// Report generation functions
const generateReport = async (reportId) => {
  try {
    const report = await Report.findById(reportId);
    if (!report) return;

    report.status = 'processing';
    await report.save();

    let data = {};
    let summary = {};

    switch (report.type) {
      case 'revenue':
        ({ data, summary } = await generateRevenueReport(report.parameters));
        break;
      case 'occupancy':
        ({ data, summary } = await generateOccupancyReport(report.parameters));
        break;
      case 'user_activity':
        ({ data, summary } = await generateUserActivityReport(report.parameters));
        break;
      case 'booking_analytics':
        ({ data, summary } = await generateBookingAnalyticsReport(report.parameters));
        break;
      default:
        throw new Error('Unknown report type');
    }

    await report.updateData(data, summary);

    // Log activity
    await ActivityLog.logActivity({
      admin: report.generatedBy,
      action: 'report_generated',
      resource: 'report',
      resourceId: report._id,
      description: `Report generated: ${report.title}`,
      details: { type: report.type, recordCount: summary.totalRecords },
      ipAddress: null,
      userAgent: null
    });

  } catch (error) {
    console.error('Report generation error:', error);
    await report.markAsFailed(error);
  }
};

const generateRevenueReport = async (parameters) => {
  const { dateRange, filters = {} } = parameters;
  const matchConditions = {};

  if (dateRange) {
    matchConditions.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  if (filters.status) {
    matchConditions.status = filters.status;
  }

  const revenueData = await Payment.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        totalRevenue: { $sum: '$amount' },
        totalRefunds: { $sum: '$totalRefunded' },
        paymentCount: { $sum: 1 },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const summary = {
    totalRecords: revenueData.length,
    totalRevenue: revenueData.reduce((sum, day) => sum + day.totalRevenue, 0),
    totalRefunds: revenueData.reduce((sum, day) => sum + day.totalRefunds, 0),
    netRevenue: 0,
    averageDailyRevenue: 0
  };

  summary.netRevenue = summary.totalRevenue - summary.totalRefunds;
  summary.averageDailyRevenue = summary.totalRecords > 0 ? summary.netRevenue / summary.totalRecords : 0;

  return { data: revenueData, summary };
};

const generateOccupancyReport = async (parameters) => {
  const { dateRange, filters = {} } = parameters;

  const occupancyData = await Booking.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        },
        status: { $in: ['completed', 'active'] }
      }
    },
    {
      $group: {
        _id: {
          slot: '$parkingSlot',
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
          }
        },
        totalBookings: { $sum: 1 },
        totalHours: { $sum: '$duration' },
        totalRevenue: { $sum: '$pricing.finalAmount' }
      }
    },
    {
      $lookup: {
        from: 'parkingslots',
        localField: '_id.slot',
        foreignField: '_id',
        as: 'slotInfo'
      }
    },
    { $unwind: '$slotInfo' },
    {
      $project: {
        slotNumber: '$slotInfo.slotNumber',
        location: '$slotInfo.location',
        date: '$_id.date',
        totalBookings: 1,
        totalHours: 1,
        totalRevenue: 1,
        occupancyRate: {
          $multiply: [
            { $divide: ['$totalHours', 24] },
            100
          ]
        }
      }
    },
    { $sort: { date: 1, slotNumber: 1 } }
  ]);

  const summary = {
    totalRecords: occupancyData.length,
    totalBookings: occupancyData.reduce((sum, record) => sum + record.totalBookings, 0),
    totalHours: occupancyData.reduce((sum, record) => sum + record.totalHours, 0),
    totalRevenue: occupancyData.reduce((sum, record) => sum + record.totalRevenue, 0),
    averageOccupancyRate: 0
  };

  summary.averageOccupancyRate = summary.totalRecords > 0
    ? occupancyData.reduce((sum, record) => sum + record.occupancyRate, 0) / summary.totalRecords
    : 0;

  return { data: occupancyData, summary };
};

const generateUserActivityReport = async (parameters) => {
  const { dateRange, filters = {} } = parameters;

  const userActivityData = await User.aggregate([
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'user',
        as: 'bookings',
        pipeline: [
          {
            $match: {
              createdAt: {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end)
              }
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'user',
        as: 'payments',
        pipeline: [
          {
            $match: {
              createdAt: {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end)
              }
            }
          }
        ]
      }
    },
    {
      $project: {
        name: 1,
        email: 1,
        totalBookings: { $size: '$bookings' },
        totalPayments: { $size: '$payments' },
        totalSpent: { $sum: '$payments.amount' },
        lastActivity: { $max: ['$bookings.createdAt', '$payments.createdAt'] }
      }
    },
    { $sort: { totalBookings: -1 } }
  ]);

  const summary = {
    totalRecords: userActivityData.length,
    totalUsers: userActivityData.length,
    activeUsers: userActivityData.filter(user => user.totalBookings > 0).length,
    totalBookings: userActivityData.reduce((sum, user) => sum + user.totalBookings, 0),
    totalRevenue: userActivityData.reduce((sum, user) => sum + user.totalSpent, 0)
  };

  return { data: userActivityData, summary };
};

const generateBookingAnalyticsReport = async (parameters) => {
  const { dateRange, filters = {} } = parameters;

  const bookingData = await Booking.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        }
      }
    },
    {
      $group: {
        _id: {
          status: '$status',
          bookingType: '$bookingType'
        },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.finalAmount' },
        averageDuration: { $avg: '$duration' }
      }
    },
    {
      $group: {
        _id: '$_id.status',
        bookingTypes: {
          $push: {
            type: '$_id.bookingType',
            count: '$count',
            revenue: '$totalRevenue',
            averageDuration: '$averageDuration'
          }
        },
        totalCount: { $sum: '$count' },
        totalRevenue: { $sum: '$totalRevenue' }
      }
    }
  ]);

  const summary = {
    totalRecords: bookingData.length,
    totalBookings: bookingData.reduce((sum, status) => sum + status.totalCount, 0),
    totalRevenue: bookingData.reduce((sum, status) => sum + status.totalRevenue, 0),
    completionRate: 0
  };

  const completedBookings = bookingData.find(item => item._id === 'completed')?.totalCount || 0;
  summary.completionRate = summary.totalBookings > 0 ? (completedBookings / summary.totalBookings) * 100 : 0;

  return { data: bookingData, summary };
};