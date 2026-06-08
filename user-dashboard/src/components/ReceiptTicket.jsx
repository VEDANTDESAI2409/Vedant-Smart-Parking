import React from 'react';
import { CarFront, ParkingCircle, QrCode } from 'lucide-react';

const safeValue = (value, fallback = 'N/A') => {
  const normalized = String(value ?? '').trim();
  return normalized || fallback;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const normalizeBookingReceipt = (booking) => ({
  bookingId: booking?.bookingReference || booking?._id,
  receiptNumber: booking?.receiptNumber || booking?._id,
  name: booking?.userSnapshot?.name || booking?.user?.name || 'Guest User',
  slot: booking?.locationSnapshot?.slotNumber,
  location: booking?.locationSnapshot?.locationName,
  dateTime: booking?.startTime,
  duration: booking?.duration,
  amount: booking?.pricing?.finalAmount,
  paymentStatus: booking?.paymentStatus === 'paid' ? 'PAID' : booking?.status,
  generatedAt: new Date().toISOString(),
});

export const buildTicketReceiptHtml = (receipt) => {
  const rows = getReceiptRows(receipt);
  const barcode = safeValue(receipt?.receiptNumber || receipt?.bookingId, 'RECEIPT');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Smart Parking Receipt</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #e8eef6;
      color: #111827;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      padding: 24px;
    }
    .ticket {
      width: min(340px, 100%);
      background: #fffdf7;
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      box-shadow: 0 28px 60px rgba(15, 23, 42, 0.18);
      overflow: hidden;
    }
    .paper-edge {
      height: 10px;
      background: repeating-linear-gradient(90deg, transparent 0 12px, #e5e7eb 12px 13px);
    }
    .content { padding: 18px 18px 20px; }
    .center { text-align: center; }
    .logo {
      width: 46px;
      height: 46px;
      margin: 0 auto 8px;
      border-radius: 50%;
      border: 2px solid #111827;
      display: grid;
      place-items: center;
      font-size: 24px;
      font-weight: 900;
    }
    h1 {
      margin: 0;
      font-size: 20px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .sub {
      margin: 5px 0 0;
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .divider {
      border: 0;
      border-top: 1px dashed #94a3b8;
      margin: 15px 0;
    }
    .row {
      display: grid;
      grid-template-columns: 112px 1fr;
      gap: 10px;
      align-items: start;
      padding: 5px 0;
      font-size: 12px;
      line-height: 1.35;
    }
    .label {
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .value {
      text-align: right;
      color: #111827;
      font-weight: 800;
      overflow-wrap: anywhere;
    }
    .slot {
      margin: 14px 0;
      border: 2px solid #111827;
      border-radius: 14px;
      padding: 12px;
      text-align: center;
      background: #f8fafc;
    }
    .slot span, .amount span {
      display: block;
      color: #64748b;
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .slot strong {
      display: block;
      margin-top: 4px;
      font-size: 32px;
      line-height: 1;
      letter-spacing: 0.08em;
    }
    .amount {
      margin: 14px 0 4px;
      border-radius: 14px;
      padding: 12px;
      text-align: center;
      background: #111827;
      color: white;
    }
    .amount span { color: rgba(255,255,255,0.68); }
    .amount strong {
      display: block;
      margin-top: 4px;
      font-size: 24px;
    }
    .paid {
      display: inline-block;
      margin: 0 auto;
      border: 2px solid #16a34a;
      border-radius: 999px;
      color: #15803d;
      padding: 7px 16px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.18em;
      transform: rotate(-2deg);
    }
    .barcode {
      height: 44px;
      margin: 13px auto 8px;
      max-width: 230px;
      background: repeating-linear-gradient(90deg, #111827 0 2px, transparent 2px 5px, #111827 5px 7px, transparent 7px 11px);
    }
    .barcode-text {
      text-align: center;
      font-size: 10px;
      letter-spacing: 0.2em;
      overflow-wrap: anywhere;
    }
    .thanks {
      margin: 12px 0 0;
      text-align: center;
      font-size: 11px;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .actions {
      display: flex;
      gap: 10px;
      padding: 0 18px 18px;
    }
    button {
      flex: 1;
      border: 0;
      border-radius: 999px;
      background: #111827;
      color: white;
      font: inherit;
      font-weight: 800;
      padding: 11px 14px;
      cursor: pointer;
    }
    @media print {
      body { background: white; padding: 0; }
      .ticket { box-shadow: none; border-radius: 0; border: 0; width: 80mm; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <article class="ticket">
    <div class="paper-edge"></div>
    <div class="content">
      <div class="center">
        <div class="logo">P</div>
        <h1>Smart Parking</h1>
        <p class="sub">${safeValue(receipt?.location, 'Parking Receipt')}</p>
      </div>
      <hr class="divider" />
      ${rows.map(([label, value]) => `<div class="row"><div class="label">${label}</div><div class="value">${value}</div></div>`).join('')}
      <div class="slot"><span>Slot</span><strong>${safeValue(receipt?.slot)}</strong></div>
      <div class="amount"><span>Amount</span><strong>${formatCurrency(receipt?.amount)}</strong></div>
      <hr class="divider" />
      <div class="center"><span class="paid">${safeValue(receipt?.paymentStatus, 'PAID').toUpperCase()}</span></div>
      <div class="barcode"></div>
      <div class="barcode-text">${barcode}</div>
      <p class="thanks">Thank you for parking with us</p>
      <div class="row"><div class="label">Generated</div><div class="value">${formatDateTime(receipt?.generatedAt || new Date())}</div></div>
    </div>
    <div class="actions">
      <button onclick="window.print()">Print</button>
      <button onclick="window.close()">Close</button>
    </div>
  </article>
</body>
</html>`;
};

export const getReceiptRows = (receipt) => [
  ['Booking ID', safeValue(receipt?.bookingId)],
  ['Receipt ID', safeValue(receipt?.receiptNumber)],
  ['Name', safeValue(receipt?.name || receipt?.customer)],
  ['Location', safeValue(receipt?.location)],
  ['Date & Time', formatDateTime(receipt?.dateTime)],
  ['Duration', `${safeValue(receipt?.duration)} hr`],
  ['Status', safeValue(receipt?.paymentStatus).toUpperCase()],
];

const ReceiptTicket = ({ receipt, actions, className = '' }) => {
  const rows = getReceiptRows(receipt);
  const barcode = safeValue(receipt?.receiptNumber || receipt?.bookingId, 'RECEIPT');

  return (
    <article className={`mx-auto w-full max-w-[360px] overflow-hidden rounded-[22px] border border-slate-200 bg-[#fffdf7] font-mono text-slate-950 shadow-[0_28px_70px_rgba(15,23,42,0.16)] ${className}`}>
      <div className="h-3 bg-[repeating-linear-gradient(90deg,transparent_0_12px,#e2e8f0_12px_13px)]" />
      <div className="px-5 pb-5 pt-5">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-950 bg-white">
            <ParkingCircle className="h-8 w-8" />
          </div>
          <h3 className="mt-3 text-xl font-black uppercase tracking-[0.12em]">Smart Parking</h3>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            {safeValue(receipt?.location, 'Parking Receipt')}
          </p>
        </div>

        <div className="my-4 border-t border-dashed border-slate-400" />

        <div className="space-y-1.5">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[112px_1fr] gap-3 text-[12px] leading-5">
              <span className="font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
              <span className="break-words text-right font-black text-slate-950">{value}</span>
            </div>
          ))}
        </div>

        <div className="my-4 rounded-[18px] border-2 border-slate-950 bg-slate-50 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            <CarFront className="h-3.5 w-3.5" />
            Slot
          </div>
          <div className="mt-1 text-4xl font-black leading-none tracking-[0.12em]">{safeValue(receipt?.slot)}</div>
        </div>

        <div className="rounded-[18px] bg-slate-950 px-4 py-3 text-center text-white">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Amount</div>
          <div className="mt-1 text-2xl font-black">{formatCurrency(receipt?.amount)}</div>
        </div>

        <div className="my-4 border-t border-dashed border-slate-400" />

        <div className="text-center">
          <span className="inline-flex rotate-[-2deg] items-center justify-center rounded-full border-2 border-emerald-600 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
            {safeValue(receipt?.paymentStatus, 'PAID').toUpperCase()}
          </span>
        </div>

        <div className="mx-auto mt-4 h-11 max-w-[240px] bg-[repeating-linear-gradient(90deg,#111827_0_2px,transparent_2px_5px,#111827_5px_7px,transparent_7px_11px)]" />
        <div className="mt-2 break-all text-center text-[10px] font-bold tracking-[0.24em] text-slate-600">{barcode}</div>

        <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-3 rounded-[16px] border border-dashed border-slate-300 bg-white px-3 py-3">
          <QrCode className="h-8 w-8 text-slate-700" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Generated</p>
            <p className="text-[11px] font-bold text-slate-950">{formatDateTime(receipt?.generatedAt || new Date())}</p>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
          Thank you for parking with us
        </p>
      </div>

      {actions ? (
        <div className="flex gap-2 border-t border-dashed border-slate-300 bg-white px-4 py-4">
          {actions}
        </div>
      ) : null}
    </article>
  );
};

export { formatCurrency, formatDateTime };
export default ReceiptTicket;
