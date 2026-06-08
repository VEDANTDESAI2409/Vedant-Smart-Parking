import React from 'react';
import { Check, Download, Share2, Ticket } from 'lucide-react';
import ReceiptTicket from '../../../components/ReceiptTicket';
import { formatCurrency, toShareText } from '../../utils/paymentFormatters';

const detailClass = 'rounded-[20px] border border-slate-100 bg-white/80 px-4 py-3';

const PaymentSuccessPanel = ({ booking, receipt, payment, onDownload, onShare, onClose }) => {
  const transactionId = payment?.transactionId || payment?.razorpay_payment_id || 'DEMO-TXN';
  const timestamp = payment?.paymentDate || payment?.updatedAt || new Date().toISOString();
  const slotNumber = receipt?.slot || booking?.locationSnapshot?.slotNumber || 'N/A';
  const bookingId = receipt?.bookingId || booking?.bookingReference || booking?._id || 'N/A';
  const amount = receipt?.amount || booking?.pricing?.finalAmount || payment?.amount || 0;

  const shareReceipt = async () => {
    const text = toShareText({ receipt, booking, transactionId });

    if (navigator.share) {
      await navigator.share({ title: 'Smart Parking Receipt', text });
      return;
    }

    await navigator.clipboard?.writeText(text);
    onShare?.('Receipt details copied');
  };

  return (
    <div className="mx-auto max-w-3xl px-2 py-6 text-center sm:px-4">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_18px_45px_rgba(16,185,129,0.28)]">
        <Check className="h-10 w-10" />
      </div>

      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">Payment Successful</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Your slot is confirmed</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        A demo transaction has been verified and your parking receipt is ready.
      </p>

      <div className="mt-7 rounded-[28px] border border-white/70 bg-white/70 p-4 text-left shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex items-center gap-3 rounded-[22px] bg-slate-950 px-4 py-4 text-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-white/60">Booking ID</p>
            <p className="text-lg font-semibold">{bookingId}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className={detailClass}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Parking Slot</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{slotNumber}</p>
          </div>
          <div className={detailClass}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Amount Paid</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(amount)}</p>
          </div>
          <div className={detailClass}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Transaction ID</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-950">{transactionId}</p>
          </div>
          <div className={detailClass}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Timestamp</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{new Date(timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <ReceiptTicket receipt={{ ...receipt, generatedAt: timestamp }} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Download Receipt
        </button>
        <button
          type="button"
          onClick={shareReceipt}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          <Share2 className="h-4 w-4" />
          Share Receipt
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessPanel;
