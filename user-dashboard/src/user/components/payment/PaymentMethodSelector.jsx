import React, { useMemo, useState } from 'react';
import {
  BadgeIndianRupee,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  Landmark,
  Loader2,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { getAdminPreferences } from '../../../utils/adminPreferences';
import { launchDemoUpiIntent, simulateProcessing } from '../../services/mockPaymentService';
import {
  detectCardType,
  formatCardNumber,
  formatCurrency,
  formatExpiry,
  validateCardForm,
} from '../../utils/paymentFormatters';

const methodButtonClass =
  'w-full rounded-[26px] border p-4 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300/70';

const upiApps = [
  { key: 'gpay', label: 'Google Pay', badge: 'GPay', tone: 'bg-slate-950 text-white' },
  { key: 'phonepe', label: 'PhonePe', badge: 'Pe', tone: 'bg-violet-600 text-white' },
  { key: 'paytm', label: 'Paytm', badge: 'Pay', tone: 'bg-sky-500 text-white' },
  { key: 'bhim', label: 'BHIM', badge: 'BH', tone: 'bg-orange-500 text-white' },
  { key: 'generic', label: 'Any UPI App', badge: 'UPI', tone: 'bg-emerald-500 text-white' },
  { key: 'manual', label: 'Enter UPI ID manually', badge: '@', tone: 'bg-white text-slate-950 border border-slate-200' },
];

const banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'];

const PaymentMethodSelector = ({
  booking,
  paymentSession,
  onInitiate,
  onVerify,
  onCancel,
  loading,
  message,
  setMessage,
}) => {
  const [expanded, setExpanded] = useState('upi');
  const [processing, setProcessing] = useState('');
  const [cardForm, setCardForm] = useState({ holderName: '', cardNumber: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [walletBalance, setWalletBalance] = useState(120);
  const [bank, setBank] = useState(banks[0]);
  const [error, setError] = useState('');

  const adminPreferences = getAdminPreferences();
  const amount = Number(paymentSession?.amount || booking?.pricing?.finalAmount || 0);
  const cardType = detectCardType(cardForm.cardNumber);

  const paymentMethods = useMemo(
    () => [
      {
        key: 'upi',
        title: 'UPI',
        subtitle: 'Pay via Google Pay, PhonePe, Paytm, BHIM, or any UPI app',
        icon: Smartphone,
        accent: 'from-blue-500 to-cyan-400',
        available: true,
      },
      {
        key: 'card',
        title: 'Credit/Debit Card',
        subtitle: 'Demo card form with live formatting and validation',
        icon: CreditCard,
        accent: 'from-slate-950 to-slate-700',
        available: true,
      },
      {
        key: 'net_banking',
        title: 'Net Banking',
        subtitle: 'Choose a bank and simulate secure authorization',
        icon: Landmark,
        accent: 'from-indigo-500 to-blue-500',
        available: true,
      },
      {
        key: 'wallet',
        title: 'Wallet',
        subtitle: 'Use your Smart Parking wallet balance',
        icon: Wallet,
        accent: 'from-emerald-500 to-teal-400',
        available: true,
      },
      {
        key: 'cash',
        title: 'Cash',
        subtitle: 'Pay at parking counter after admin-enabled confirmation',
        icon: Banknote,
        accent: 'from-amber-500 to-orange-400',
        available: Boolean(adminPreferences.enableCashPayments),
      },
      {
        key: 'pay_later',
        title: 'Pay Later',
        subtitle: 'Reserve now and settle after checkout',
        icon: BadgeIndianRupee,
        accent: 'from-fuchsia-500 to-rose-400',
        available: Boolean(adminPreferences.enablePayLaterPayments),
      },
    ],
    [adminPreferences.enableCashPayments, adminPreferences.enablePayLaterPayments],
  );

  const initiate = async (payload) => {
    if (paymentSession?.method === payload.paymentMethod) return paymentSession;
    return onInitiate({
      ...payload,
      demoMode: true,
    });
  };

  const verifyDemoPayment = async ({ method, channel, transactionId, extra = {} }) => {
    setProcessing(method);
    setError('');

    try {
      const session = await initiate({
        paymentMethod: method,
        paymentChannel: channel,
        upiApp: extra.upiApp,
        cardLast4: extra.cardLast4,
      });

      await onVerify({
        session,
        status: 'success',
        transactionId,
        gatewayResponse: {
          demoMode: true,
          method,
          channel,
          ...extra,
        },
      });
    } catch (nextError) {
      setError(nextError?.response?.data?.message || nextError.message || 'Payment failed');
    } finally {
      setProcessing('');
    }
  };

  const handleUpi = async (app) => {
    if (app === 'manual' && !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
      setError('Enter a valid UPI ID');
      return;
    }

    setProcessing(`upi-${app}`);
    setMessage('');
    setError('');

    try {
      const session = await initiate({ paymentMethod: 'upi', upiApp: app, paymentChannel: app });
      const upiResult = await launchDemoUpiIntent({ amount: session.amount || amount, app });
      setMessage(upiResult.message);

      await onVerify({
        session,
        status: 'success',
        transactionId: upiResult.transactionId,
        gatewayResponse: {
          demoMode: true,
          method: 'upi',
          upiApp: app,
          upiId: app === 'manual' ? upiId.trim() : '',
          openedApp: upiResult.opened,
        },
      });
    } catch (nextError) {
      setError(nextError?.response?.data?.message || nextError.message || 'UPI payment failed');
    } finally {
      setProcessing('');
    }
  };

  const handleCard = async (event) => {
    event.preventDefault();
    const validationError = validateCardForm(cardForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await simulateProcessing(cardType.toUpperCase());
    await verifyDemoPayment({
      method: 'card',
      channel: cardType,
      transactionId: result.transactionId,
      extra: {
        cardType,
        cardLast4: cardForm.cardNumber.replace(/\D/g, '').slice(-4),
      },
    });
  };

  const handleSimpleMethod = async (method, channel) => {
    const result = await simulateProcessing(method.toUpperCase());
    await verifyDemoPayment({ method, channel, transactionId: result.transactionId });
  };

  const walletShortfall = Math.max(0, amount - walletBalance);

  return (
    <div className="mx-auto max-w-5xl px-2 pb-6 sm:px-4">
      <div className="sticky top-0 z-10 -mx-2 border-b border-white/60 bg-[linear-gradient(180deg,#f8fbff_0%,rgba(248,251,255,0.92)_100%)] px-2 py-4 backdrop-blur-xl sm:-mx-4 sm:px-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600">Select Payment Method</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">How would you like to pay?</h2>
            <p className="mt-1 text-sm text-slate-600">
              Slot {booking?.locationSnapshot?.slotNumber || 'N/A'} is locked until{' '}
              {paymentSession?.expiresAt ? new Date(paymentSession.expiresAt).toLocaleTimeString() : 'payment expiry'}.
            </p>
          </div>
          <div className="rounded-[22px] border border-blue-100 bg-white px-4 py-3 text-left shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Amount Due</p>
            <p className="text-xl font-semibold text-slate-950">{formatCurrency(amount)}</p>
          </div>
        </div>
      </div>

      {message ? <div className="mt-4 rounded-[22px] bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">{message}</div> : null}
      {error ? <div className="mt-4 rounded-[22px] bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}

      <div className="mt-5 space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isOpen = expanded === method.key;
          const isBusy = loading || Boolean(processing);

          return (
            <section
              key={method.key}
              className={`overflow-hidden rounded-[30px] border bg-white/90 shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition-all duration-300 ${
                isOpen ? 'border-blue-200' : 'border-slate-100'
              } ${!method.available ? 'opacity-60' : ''}`}
            >
              <button
                type="button"
                onClick={() => method.available && setExpanded(isOpen ? '' : method.key)}
                className={`${methodButtonClass} ${isOpen ? 'border-blue-200 bg-blue-50/50' : 'border-transparent bg-white hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br ${method.accent} p-3 text-white shadow-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-950">{method.title}</h3>
                      {!method.available ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">Disabled</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{method.subtitle}</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="border-t border-slate-100 p-4 sm:p-5">
                    {method.key === 'upi' ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {upiApps.map((app) => (
                          <button
                            key={app.key}
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleUpi(app.key)}
                            className="group rounded-[24px] border border-slate-100 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40 disabled:opacity-70"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-black ${app.tone}`}>
                                {processing === `upi-${app.key}` ? <Loader2 className="h-4 w-4 animate-spin" /> : app.badge}
                              </span>
                              <div>
                                <p className="font-semibold text-slate-950">{app.label}</p>
                                <p className="text-xs text-slate-500">{app.key === 'gpay' ? 'Opens GPay intent on mobile' : 'Demo UPI collect'}</p>
                              </div>
                            </div>
                          </button>
                        ))}

                        <label className="rounded-[24px] border border-slate-100 bg-white p-4 sm:col-span-2 lg:col-span-3">
                          <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Manual UPI ID</span>
                          <input
                            value={upiId}
                            onChange={(event) => setUpiId(event.target.value)}
                            placeholder="name@bank"
                            className="mt-2 w-full rounded-[18px] border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          />
                        </label>
                      </div>
                    ) : null}

                    {method.key === 'card' ? (
                      <form onSubmit={handleCard} className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-[26px] bg-gradient-to-br from-slate-950 to-slate-700 p-5 text-white shadow-[0_24px_50px_rgba(15,23,42,0.2)]">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{cardType}</span>
                            <CreditCard className="h-6 w-6 text-white/70" />
                          </div>
                          <p className="mt-10 font-mono text-lg tracking-[0.16em]">
                            {cardForm.cardNumber || '0000 0000 0000 0000'}
                          </p>
                          <div className="mt-6 flex justify-between text-xs uppercase tracking-[0.14em] text-white/70">
                            <span>{cardForm.holderName || 'CARD HOLDER'}</span>
                            <span>{cardForm.expiry || 'MM/YY'}</span>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            value={cardForm.holderName}
                            onChange={(event) => setCardForm((state) => ({ ...state, holderName: event.target.value.toUpperCase() }))}
                            placeholder="Card Holder Name"
                            className="rounded-[18px] border border-slate-100 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
                          />
                          <input
                            value={cardForm.cardNumber}
                            inputMode="numeric"
                            onChange={(event) => setCardForm((state) => ({ ...state, cardNumber: formatCardNumber(event.target.value) }))}
                            placeholder="Card Number"
                            className="rounded-[18px] border border-slate-100 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
                          />
                          <input
                            value={cardForm.expiry}
                            inputMode="numeric"
                            onChange={(event) => setCardForm((state) => ({ ...state, expiry: formatExpiry(event.target.value) }))}
                            placeholder="MM/YY"
                            className="rounded-[18px] border border-slate-100 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />
                          <input
                            value={cardForm.cvv}
                            inputMode="numeric"
                            type="password"
                            maxLength="4"
                            onChange={(event) => setCardForm((state) => ({ ...state, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                            placeholder="CVV"
                            className="rounded-[18px] border border-slate-100 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />
                          <button
                            type="submit"
                            disabled={isBusy}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70 sm:col-span-2"
                          >
                            {processing === 'card' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Pay {formatCurrency(amount)}
                          </button>
                        </div>
                      </form>
                    ) : null}

                    {method.key === 'wallet' ? (
                      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Wallet Balance</p>
                          <p className="mt-1 text-2xl font-semibold text-emerald-950">{formatCurrency(walletBalance)}</p>
                          {walletShortfall > 0 ? (
                            <p className="mt-2 text-sm text-rose-600">Insufficient by {formatCurrency(walletShortfall)}</p>
                          ) : (
                            <p className="mt-2 text-sm text-emerald-700">Enough balance for this booking</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={() => setWalletBalance((value) => value + 250)}
                            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
                          >
                            Add Money
                          </button>
                          <button
                            type="button"
                            disabled={isBusy || walletShortfall > 0}
                            onClick={() => handleSimpleMethod('wallet', 'Smart Parking Wallet')}
                            className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {processing === 'wallet' ? 'Processing...' : 'Pay from Wallet'}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {method.key === 'net_banking' ? (
                      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                        <label>
                          <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Choose Bank</span>
                          <select
                            value={bank}
                            onChange={(event) => setBank(event.target.value)}
                            className="mt-2 w-full rounded-[18px] border border-slate-100 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          >
                            {banks.map((item) => (
                              <option key={item}>{item}</option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleSimpleMethod('net_banking', bank)}
                          className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70"
                        >
                          {processing === 'net_banking' ? 'Authorizing...' : 'Continue'}
                        </button>
                      </div>
                    ) : null}

                    {method.key === 'cash' || method.key === 'pay_later' ? (
                      <div className="flex flex-col gap-4 rounded-[24px] border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm leading-6 text-slate-600">
                          This demo will confirm the booking using {method.title}. A real project can plug admin approval,
                          collection rules, or partner credit checks here.
                        </p>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleSimpleMethod(method.key, method.title)}
                          className="shrink-0 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
                        >
                          {processing === method.key ? 'Confirming...' : `Confirm ${method.title}`}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || Boolean(processing)}
          className="rounded-full border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-70"
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
