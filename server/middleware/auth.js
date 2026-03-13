const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (if implemented)
    // else if (req.cookies.token) {
    //   token = req.cookies.token;
    // }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user or admin based on role
      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('+password');
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
          });
        }
      } else {
        req.user = await User.findById(decoded.id);
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
          });
        }

        // Check if user is active
        if (!req.user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Account is deactivated'
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'User role not authorized to access this route'
      });
    }

    next();
  };
};

// Check if user is admin
exports.adminRoleCheck = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  // Check specific permissions if provided
  if (req.requiredPermissions) {
    const hasPermission = req.requiredPermissions.every(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
  }

  next();
};

// Check if user owns the resource or is admin
exports.ownerOrAdmin = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceId = req.params.id || req.body[resourceField];
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID not found'
      });
    }

    // For now, we'll assume the resource has a user field
    // In actual implementation, you might need to fetch the resource
    // and check ownership here, or pass it from the controller

    // This is a placeholder - actual implementation would depend on the route
    if (req.resourceUser && req.resourceUser.toString() === req.user.id) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied - not the owner'
    });
  };
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role === 'admin') {
          req.user = await Admin.findById(decoded.id);
        } else {
          req.user = await User.findById(decoded.id);
        }
      } catch (error) {
        // Token is invalid but we don't fail - just continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};

// Rate limiting helper (basic implementation)
const requestCounts = new Map();

exports.rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }

    const requests = requestCounts.get(key);
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }

    validRequests.push(now);
    requestCounts.set(key, validRequests);

    next();
  };
};

// Clean up old rate limit data periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const windowStart = now - windowMs;

  for (const [key, requests] of requestCounts.entries()) {
    const validRequests = requests.filter(time => time > windowStart);
    if (validRequests.length === 0) {
      requestCounts.delete(key);
    } else {
      requestCounts.set(key, validRequests);
    }
  }
}, 60 * 1000); // Clean up every minute