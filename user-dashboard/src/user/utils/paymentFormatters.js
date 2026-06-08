export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

export const generateDemoTransactionId = (prefix = 'TXN') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const formatCardNumber = (value) =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

export const formatExpiry = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export const detectCardType = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^(60|65|81|82|508|353|356)/.test(digits)) return 'RuPay';
  if (/^3[47]/.test(digits)) return 'Amex';
  return 'Card';
};

export const validateCardForm = ({ holderName, cardNumber, expiry, cvv }) => {
  const digits = String(cardNumber || '').replace(/\D/g, '');
  const [month = '', year = ''] = String(expiry || '').split('/');
  const expiryMonth = Number(month);
  const expiryYear = Number(`20${year}`);
  const endOfMonth = new Date(expiryYear, expiryMonth, 0, 23, 59, 59);

  if (String(holderName || '').trim().length < 3) return 'Enter the card holder name';
  if (digits.length < 13 || digits.length > 19) return 'Enter a valid card number';
  if (!/^\d{2}\/\d{2}$/.test(expiry) || expiryMonth < 1 || expiryMonth > 12) return 'Enter a valid expiry date';
  if (endOfMonth.getTime() < Date.now()) return 'Card expiry date is in the past';
  if (!/^\d{3,4}$/.test(String(cvv || ''))) return 'Enter a valid CVV';
  return '';
};

export const toShareText = ({ receipt, booking, transactionId }) => {
  const bookingId = receipt?.bookingId || booking?.bookingReference || booking?._id || 'N/A';
  const slot = receipt?.slot || booking?.locationSnapshot?.slotNumber || 'N/A';
  const amount = receipt?.amount || booking?.pricing?.finalAmount || 0;

  return [
    'Smart Parking payment successful',
    `Booking: ${bookingId}`,
    `Slot: ${slot}`,
    `Amount: ${formatCurrency(amount)}`,
    `Transaction: ${transactionId || 'N/A'}`,
  ].join('\n');
};
