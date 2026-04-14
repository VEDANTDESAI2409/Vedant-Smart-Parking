const E164_REGEX = /^\+[1-9]\d{7,14}$/;

const normalizePhoneToE164 = (phone) => String(phone || '').trim().replace(/[^\d+]/g, '');

const isE164Phone = (phone) => E164_REGEX.test(normalizePhoneToE164(phone));

module.exports = {
  normalizePhoneToE164,
  isE164Phone,
};
