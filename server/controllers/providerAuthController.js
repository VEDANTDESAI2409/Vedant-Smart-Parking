const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { getFirebaseAdminAuth } = require('../config/firebaseAdmin');
const { syncUserRecord, getAuthProfileById } = require('../services/authUserService');
const { sendOtp: sendTwilioOtp, checkOtp } = require('../services/twilioVerifyService');
const { assertCanSendOtp } = require('../services/otpRateLimiter');
const { isE164Phone, normalizePhoneToE164 } = require('../utils/phone');

const generateToken = (id, role = 'user') =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const getRequestIp = (req) =>
  (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || req.socket.remoteAddress || 'unknown';

const sendOtpResponse = async (req, res, isResend = false) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const phone = normalizePhoneToE164(req.body.phone);

  if (!isE164Phone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Phone number must be in E.164 format, for example +14155552671.',
    });
  }

  try {
    const limitState = assertCanSendOtp({ phone, ip: getRequestIp(req), isResend });
    const verification = await sendTwilioOtp(phone);

    return res.status(200).json({
      success: true,
      message: isResend ? 'OTP resent successfully.' : 'OTP sent successfully.',
      data: {
        sid: verification.sid,
        status: verification.status,
        phone,
        remainingAttempts: limitState.remainingAttempts,
        retryAfterSeconds: limitState.resendAvailableIn,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Unable to send OTP right now.',
      retryAfter: error.retryAfter || undefined,
    });
  }
};

exports.sendOtp = async (req, res) => sendOtpResponse(req, res, false);

exports.resendOtp = async (req, res) => sendOtpResponse(req, res, true);

exports.verifyOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const phone = normalizePhoneToE164(req.body.phone);
  const code = String(req.body.code || '').trim();

  if (!isE164Phone(phone)) {
    return res.status(400).json({
      success: false,
      message: 'Phone number must be in E.164 format, for example +14155552671.',
    });
  }

  try {
    const verification = await checkOtp(phone, code);

    if (verification.status !== 'approved' || !verification.valid) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    const user = await syncUserRecord({
      provider: 'phone',
      phone,
      phoneVerified: true,
      name: req.body.name,
      email: req.body.email,
    });

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Phone number verified successfully.',
      token,
      user,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'OTP verification failed.',
    });
  }
};

exports.createFirebaseSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(req.body.idToken, true);
    const provider = decoded.firebase?.sign_in_provider;

    if (provider === 'password' && !decoded.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.',
      });
    }

    const user = await syncUserRecord({
      firebaseUid: decoded.uid,
      provider: provider === 'google.com' ? 'google' : 'firebase-email',
      name: decoded.name || req.body.name || decoded.email || 'Park n Go User',
      email: decoded.email || req.body.email,
      phone: decoded.phone_number || req.body.phone,
      emailVerified: Boolean(decoded.email_verified),
      phoneVerified: Boolean(decoded.phone_number),
    });

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid Firebase token.',
    });
  }
};

exports.getAuthenticatedProfile = async (req, res) => {
  try {
    const profile = await getAuthProfileById(req.user.id);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to load authentication profile.',
    });
  }
};
