const DEV_ADMIN_ID = process.env.DEV_ADMIN_ID || '000000000000000000000001';
const DEV_ADMIN_EMAIL = (process.env.DEV_ADMIN_EMAIL || 'admin@smartparking.com').toLowerCase();
const DEV_ADMIN_PASSWORD = process.env.DEV_ADMIN_PASSWORD || 'admin123';
const DEV_ADMIN_NAME = process.env.DEV_ADMIN_NAME || 'Development Admin';
const DEV_ADMIN_PERMISSIONS = [
  'manage_users',
  'manage_slots',
  'manage_bookings',
  'manage_payments',
  'view_reports',
  'manage_admins',
  'system_settings'
];

const isDevAdminLoginEnabled = () =>
  process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_ADMIN_LOGIN === 'true';

const getDevAdminUser = () => ({
  _id: DEV_ADMIN_ID,
  id: DEV_ADMIN_ID,
  name: DEV_ADMIN_NAME,
  email: DEV_ADMIN_EMAIL,
  role: 'superadmin',
  permissions: DEV_ADMIN_PERMISSIONS,
  isActive: true,
  lastLogin: null
});

const matchesDevAdminCredentials = (email, password) =>
  isDevAdminLoginEnabled() &&
  email.toLowerCase() === DEV_ADMIN_EMAIL &&
  password === DEV_ADMIN_PASSWORD;

module.exports = {
  DEV_ADMIN_ID,
  DEV_ADMIN_EMAIL,
  DEV_ADMIN_PASSWORD,
  isDevAdminLoginEnabled,
  getDevAdminUser,
  matchesDevAdminCredentials
};
