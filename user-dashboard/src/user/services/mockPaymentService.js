import { generateDemoTransactionId } from '../utils/paymentFormatters';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const buildDemoUpiLink = ({ amount, app = 'generic', transactionId }) => {
  const params = new URLSearchParams({
    pa: 'test@upi',
    pn: 'SmartParking',
    am: String(Number(amount || 0).toFixed(2)),
    cu: 'INR',
    tn: 'Smart Parking demo payment',
    tr: transactionId,
  });

  const schemes = {
    gpay: 'gpay://upi/pay',
    phonepe: 'phonepe://pay',
    paytm: 'paytmmp://pay',
    bhim: 'bhim://upi/pay',
    generic: 'upi://pay',
    manual: 'upi://pay',
  };

  return `${schemes[app] || schemes.generic}?${params.toString()}`;
};

export const launchDemoUpiIntent = async ({ amount, app }) => {
  const transactionId = generateDemoTransactionId(app === 'gpay' ? 'GPAY' : 'UPI');
  const link = buildDemoUpiLink({ amount, app, transactionId });
  const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent || '');

  if (!isMobile) {
    await wait(700);
    return {
      opened: false,
      transactionId,
      message: 'UPI apps can only open from a mobile browser. Demo success is simulated here.',
    };
  }

  window.location.href = link;
  await wait(1800);

  return {
    opened: true,
    transactionId,
    message: 'Returned from UPI app. Demo payment is being confirmed.',
  };
};

export const simulateProcessing = async (label = 'SIM') => {
  await wait(1200);
  return {
    transactionId: generateDemoTransactionId(label),
  };
};
