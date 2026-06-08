const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  if (!keyId || !keySecret) {
    throw new Error('Razorpay test keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  if (!keyId.startsWith('rzp_test_')) {
    throw new Error('Only Razorpay TEST MODE keys are allowed in this project.');
  }

  return { keyId, keySecret };
};

const getRazorpayClient = () => {
  const { keyId, keySecret } = getRazorpayConfig();
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

const normalizeAmount = (amount) => {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed * 100);
};

exports.createOrder = async (req, res) => {
  try {
    const { amount, userId } = req.body;
    const amountInPaise = normalizeAmount(amount);

    if (!amountInPaise || !userId) {
      return res.status(400).json({
        success: false,
        message: 'amount and userId are required',
      });
    }

    const { keyId } = getRazorpayConfig();
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: String(userId),
        mode: 'test',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Razorpay test order created',
      data: {
        keyId,
        order,
      },
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to create Razorpay order',
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay payment ids, signature, userId, and amount are required',
      });
    }

    const { keySecret } = getRazorpayConfig();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;
    const payment = await Payment.create({
      userId: String(userId),
      amount: Number(amount),
      currency: 'INR',
      paymentMethod: 'card',
      paymentGateway: 'razorpay',
      status: isValid ? 'success' : 'failed',
      transactionId: razorpay_payment_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      paymentDate: new Date(),
      gatewayResponse: {
        verified: isValid,
        mode: 'test',
      },
      verification: {
        verifiedAt: isValid ? new Date() : null,
        verifiedBy: 'razorpay_signature',
        verificationReference: razorpay_order_id,
      },
    });

    return res.status(isValid ? 200 : 400).json({
      success: isValid,
      message: isValid ? 'Payment verified successfully' : 'Payment signature verification failed',
      data: { payment },
    });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify Razorpay payment',
    });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: String(req.params.userId) })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    console.error('Get user Razorpay payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch user payments',
    });
  }
};

exports.getAdminPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('user', 'name email phone')
      .populate('booking', 'bookingReference')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    console.error('Get admin Razorpay payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch admin payments',
    });
  }
};
