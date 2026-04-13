const otpState = new Map();

const SEND_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

const createKey = (phone, ip) => `${phone}:${ip}`;

const getRecord = (key) => {
  const now = Date.now();
  const current = otpState.get(key);

  if (!current || current.windowStartedAt + WINDOW_MS < now) {
    const fresh = {
      sendCount: 0,
      resendCount: 0,
      windowStartedAt: now,
      lastSentAt: 0,
    };
    otpState.set(key, fresh);
    return fresh;
  }

  return current;
};

const assertCanSendOtp = ({ phone, ip, isResend = false }) => {
  const key = createKey(phone, ip);
  const record = getRecord(key);
  const now = Date.now();

  if (record.sendCount >= SEND_LIMIT) {
    const retryAfter = Math.ceil((record.windowStartedAt + WINDOW_MS - now) / 1000);
    const error = new Error('Too many OTP requests. Please try again later.');
    error.statusCode = 429;
    error.retryAfter = retryAfter;
    throw error;
  }

  if (isResend && record.lastSentAt && now - record.lastSentAt < RESEND_COOLDOWN_MS) {
    const retryAfter = Math.ceil((RESEND_COOLDOWN_MS - (now - record.lastSentAt)) / 1000);
    const error = new Error(`Please wait ${retryAfter} seconds before requesting another OTP.`);
    error.statusCode = 429;
    error.retryAfter = retryAfter;
    throw error;
  }

  record.sendCount += 1;
  if (isResend) {
    record.resendCount += 1;
  }
  record.lastSentAt = now;
  otpState.set(key, record);

  return {
    remainingAttempts: Math.max(SEND_LIMIT - record.sendCount, 0),
    resendAvailableIn: Math.ceil(RESEND_COOLDOWN_MS / 1000),
  };
};

setInterval(() => {
  const now = Date.now();

  for (const [key, value] of otpState.entries()) {
    if (value.windowStartedAt + WINDOW_MS < now) {
      otpState.delete(key);
    }
  }
}, 60 * 1000);

module.exports = {
  assertCanSendOtp,
};
