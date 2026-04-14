const express = require('express');

const { getRoot } = require('../controllers/rootController');

// Import all route modules
const authRoutes = require('./auth');
const locationsRoutes = require('./locations');
const areasRoutes = require('./areas');
const citiesRoutes = require('./cities');
const pincodesRoutes = require('./pincodes');
const slotsRoutes = require('./slots');
const bookingsRoutes = require('./bookings');
const paymentsRoutes = require('./payments');
const usersRoutes = require('./users');
const vehiclesRoutes = require('./vehicles');
const reportsRoutes = require('./reports');
const importsRoutes = require('./imports');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/locations', locationsRoutes);
router.use('/areas', areasRoutes);
router.use('/cities', citiesRoutes);
router.use('/pincodes', pincodesRoutes);
router.use('/slots', slotsRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/users', usersRoutes);
router.use('/vehicles', vehiclesRoutes);
router.use('/reports', reportsRoutes);
router.use('/imports', importsRoutes);

// Root route
router.get('/', getRoot);

module.exports = router;
