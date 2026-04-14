const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const User = require('../models/User');
const { getFirebaseAdminAuth } = require('../config/firebaseAdmin');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
const OTP_EXPIRY_MS = 5 * 60 * 1000;

const otpStore = new Map();
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const normalizeIndianPhone = (phone) => {
  if (typeof phone !== 'string') {
    return null;
  }

  const cleanedPhone = phone.trim().replace(/[\s()-]/g, '');

  if (/^[6-9]\d{9}$/.test(cleanedPhone)) {
    return `+91${cleanedPhone}`;
  }

  if (/^\+91[6-9]\d{9}$/.test(cleanedPhone)) {
    return cleanedPhone;
  }

  return null;
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (userId) =>
  jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

const sendOtpToPhone = async (normalizedPhone) => {
  const otp = generateOtp();
  const expiry = Date.now() + OTP_EXPIRY_MS;

  otpStore.set(normalizedPhone, { otp, expiry });

  try {
    await twilioClient.messages.create({
      body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
    });

    return {
      success: true,
      message: 'OTP sent successfully',
      phone: normalizedPhone,
    };
  } catch (twilioError) {
    return {
      success: true,
      message: 'Twilio SMS failed. Returning OTP for development fallback.',
      phone: normalizedPhone,
      otp,
      fallback: true,
      twilioError: twilioError.message,
    };
  }
};

const verifyStoredOtp = (normalizedPhone, enteredOtp) => {
  const storedOtpData = otpStore.get(normalizedPhone);

  if (!storedOtpData) {
    return {
      valid: false,
      status: 404,
      message: 'OTP not found for this phone number',
    };
  }

  if (Date.now() > storedOtpData.expiry) {
    otpStore.delete(normalizedPhone);

    return {
      valid: false,
      status: 400,
      message: 'OTP has expired',
    };
  }

  if (storedOtpData.otp !== enteredOtp) {
    return {
      valid: false,
      status: 400,
      message: 'Invalid OTP',
    };
  }

  otpStore.delete(normalizedPhone);

  return { valid: true };
};

const sendOtp = async (req, res) => {
  try {
    const normalizedPhone = normalizeIndianPhone(req.body?.phone);

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Indian phone number',
      });
    }

    const response = await sendOtpToPhone(normalizedPhone);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while sending OTP',
      error: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const normalizedPhone = normalizeIndianPhone(req.body?.phone);
    const enteredOtp = String(req.body?.otp || '').trim();

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Indian phone number',
      });
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP',
      });
    }

    const otpValidation = verifyStoredOtp(normalizedPhone, enteredOtp);

    if (!otpValidation.valid) {
      return res.status(otpValidation.status).json({
        success: false,
        message: otpValidation.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      phone: normalizedPhone,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP',
      error: error.message,
    });
  }
};

const signup = async (req, res) => {
  try {
    const { name, phone, email, otp } = req.body;
    const normalizedPhone = normalizeIndianPhone(phone);
    const enteredOtp = String(otp || '').trim();

    if (!name || !normalizedPhone || !email || !enteredOtp) {
      return res.status(400).json({
        success: false,
        message: 'name, phone, email and otp are required',
      });
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP',
      });
    }

    const otpValidation = verifyStoredOtp(normalizedPhone, enteredOtp);

    if (!otpValidation.valid) {
      return res.status(otpValidation.status).json({
        success: false,
        message: otpValidation.message,
      });
    }

    const existingUser = await User.findOne({
      $or: [{ phone: normalizedPhone }, { email: String(email).toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = await User.create({
      name: String(name).trim(),
      phone: normalizedPhone,
      email: String(email).trim().toLowerCase(),
      isVerified: true,
      phoneVerified: true,
      authProviders: {
        password: false,
        phone: true,
        google: false,
        firebaseEmail: false,
      },
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const normalizedPhone = normalizeIndianPhone(req.body?.phone);

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Indian phone number',
      });
    }

    const user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Not a registered account, Sign up first',
      });
    }

    const response = await sendOtpToPhone(normalizedPhone);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

const verifyLogin = async (req, res) => {
  try {
    const normalizedPhone = normalizeIndianPhone(req.body?.phone);
    const enteredOtp = String(req.body?.otp || '').trim();

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Indian phone number',
      });
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP',
      });
    }

    const user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Not a registered account, Sign up first',
      });
    }

    const otpValidation = verifyStoredOtp(normalizedPhone, enteredOtp);

    if (!otpValidation.valid) {
      return res.status(otpValidation.status).json({
        success: false,
        message: otpValidation.message,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login verification',
      error: error.message,
    });
  }
};

const googleAuth = async (req, res) => {
  try {
    const idToken = String(req.body?.idToken || '').trim();

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase ID token is required',
      });
    }

    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
    const email = String(decodedToken.email || '').trim().toLowerCase();
    const name = String(decodedToken.name || '').trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google account email is required',
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        isVerified: true,
        emailVerified: true,
        authProviders: {
          password: false,
          phone: false,
          google: true,
          firebaseEmail: false,
        },
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      user: buildUserResponse(user),
      token,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message,
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  signup,
  login,
  verifyLogin,
  googleAuth,
};
