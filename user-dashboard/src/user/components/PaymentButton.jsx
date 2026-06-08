import React, { useState } from 'react';
import { Loader2, WalletCards } from 'lucide-react';
import { razorpayPaymentsAPI } from '../../services/api';
import { showError, showSuccess } from '../../utils/toastService';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PaymentButton = ({ amount, userId, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      showError('Enter a valid amount');
      return;
    }

    if (!userId) {
      showError('Login is required before payment');
      return;
    }

    try {
      setLoading(true);
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout');
      }

      const orderResponse = await razorpayPaymentsAPI.createOrder({
        amount: Number(amount),
        userId,
      });

      const { keyId, order } = orderResponse.data.data;

      const checkout = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'ParkNGo',
        description: 'Smart Parking Test Payment',
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#0ea5e9',
        },
        handler: async (response) => {
          const verifyResponse = await razorpayPaymentsAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId,
            amount: Number(amount),
          });

          showSuccess(verifyResponse.data.message || 'Payment successful');
          onSuccess?.(verifyResponse.data.data.payment);
        },
        modal: {
          ondismiss: () => {
            showError('Payment was cancelled');
          },
        },
      });

      checkout.open();
    } catch (error) {
      showError(error?.response?.data?.message || error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(14,165,233,0.2)] transition hover:bg-[#0369a1] disabled:opacity-70 sm:w-auto"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletCards className="h-4 w-4" />}
      {loading ? 'Opening Razorpay...' : 'Pay Now'}
    </button>
  );
};

export default PaymentButton;
