const twilio = require('twilio');

let twilioClient;

const getTwilioClient = () => {
  if (twilioClient) {
    return twilioClient;
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials are missing. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
  }

  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return twilioClient;
};

const getVerifyServiceSid = () => {
  if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
    throw new Error('TWILIO_VERIFY_SERVICE_SID is missing.');
  }

  return process.env.TWILIO_VERIFY_SERVICE_SID;
};

const sendOtp = async (phone) => {
  const client = getTwilioClient();
  return client.verify.v2
    .services(getVerifyServiceSid())
    .verifications.create({ to: phone, channel: 'sms' });
};

const checkOtp = async (phone, code) => {
  const client = getTwilioClient();
  return client.verify.v2
    .services(getVerifyServiceSid())
    .verificationChecks.create({ to: phone, code });
};

module.exports = {
  sendOtp,
  checkOtp,
};
