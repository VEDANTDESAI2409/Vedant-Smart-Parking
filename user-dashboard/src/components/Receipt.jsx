import React from 'react';
import { FaBarcode, FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaCar, FaBolt } from 'react-icons/fa';

const Receipt = ({ booking, onClose }) => {
  if (!booking) return null;

  const safeJoin = (parts, separator = ', ') =>
    (Array.isArray(parts) ? parts : [])
      .map((part) => String(part || '').trim())
      .filter(Boolean)
      .join(separator);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSlotType = (slotType) => {
    const normalized = String(slotType || 'normal').toLowerCase();
    if (normalized === 'ev') return 'EV';
    if (normalized === 'disabled') return 'Accessible';
    if (normalized === 'reserved') return 'Reserved';
    return 'Normal';
  };

  const downloadReceipt = () => {
    const addressLine = safeJoin(
      [booking.locationSnapshot?.area, booking.locationSnapshot?.city].filter(Boolean),
      ', '
    );

    const pincodeLine = String(booking.locationSnapshot?.pincode || '').trim();
    const slotTypeLabel = formatSlotType(booking.locationSnapshot?.slotType);

    const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Park N Go VIP Ticket</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #090b17;
      color: #f8fafc;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .ticket {
      width: min(420px, calc(100vw - 32px));
      border-radius: 36px;
      overflow: hidden;
      box-shadow: 0 40px 80px rgba(15, 23, 42, 0.55);
      background: linear-gradient(180deg, rgba(79, 70, 229, 0.96) 0%, rgba(236, 72, 153, 0.95) 100%);
      border: 1px solid rgba(255,255,255,0.06);
    }
    .ticket-header {
      padding: 28px 24px 20px;
      background: linear-gradient(135deg, #7c3aed, #ec4899, #6366f1);
      color: white;
      text-align: center;
    }
    .vip-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 8px 16px;
      border-radius: 999px;
      background: rgba(255,255,255,0.14);
      color: #f8fafc;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 18px;
    }
    .ticket-title {
      margin: 0;
      font-size: clamp(2rem, 4vw, 2.7rem);
      line-height: 1;
      font-weight: 800;
      letter-spacing: -0.04em;
    }
    .ticket-subtitle {
      margin-top: 12px;
      color: rgba(255,255,255,0.8);
      font-size: 0.92rem;
    }
    .ticket-body {
      padding: 26px 24px 24px;
      background: #0f172a;
    }
    .ticket-block {
      border-radius: 28px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(148, 163, 184, 0.12);
      padding: 20px;
      margin-bottom: 18px;
    }
    .ticket-label {
      display: block;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(226,232,240,0.6);
      margin-bottom: 8px;
    }
    .ticket-value {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f8fafc;
      line-height: 1.2;
    }
    .ticket-meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 16px;
    }
    .ticket-meta-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .ticket-chip {
      display: block;
      border-radius: 22px;
      background: rgba(255,255,255,0.06);
      padding: 14px 16px;
    }
    .ticket-chip strong {
      display: block;
      font-size: 1rem;
      color: #f8fafc;
      margin-top: 6px;
      font-weight: 800;
    }
    .ticket-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 24px 0;
      color: rgba(148, 163, 184, 0.9);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.24em;
      justify-content: center;
    }
    .ticket-divider::before,
    .ticket-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(148, 163, 184, 0.25);
    }
    .barcode {
      padding: 20px 18px 22px;
      border-radius: 28px;
      background: rgba(255,255,255,0.06);
      text-align: center;
      border: 1px dashed rgba(255,255,255,0.15);
    }
    .barcode-line {
      display: inline-block;
      width: 100%;
      max-width: 240px;
      height: 36px;
      margin: 0 auto 14px;
      background: linear-gradient(90deg, rgba(255,255,255,0.98) 10%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.98) 30%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.98) 50%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.98) 70%, rgba(255,255,255,0.08) 80%, rgba(255,255,255,0.98) 90%);
      border-radius: 8px;
    }
    .barcode-text {
      margin-top: 10px;
      font-size: 0.75rem;
      letter-spacing: 0.24em;
      color: rgba(226,232,240,0.72);
    }
    .muted-line {
      margin-top: 8px;
      font-size: 0.85rem;
      color: rgba(226,232,240,0.7);
      line-height: 1.35;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      font-size: 0.75rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(248,250,252,0.92);
      font-weight: 800;
    }
    .ticket-actions {
      margin-top: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .button-primary {
      border: none;
      border-radius: 999px;
      padding: 14px 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      cursor: pointer;
      color: #f8fafc;
      background: linear-gradient(135deg, #a855f7, #ec4899, #6366f1);
      box-shadow: 0 20px 50px rgba(124, 58, 237, 0.25);
    }
    .button-secondary {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: #f8fafc;
    }
  </style>
</head>
<body>
  <article class="ticket">
    <div class="ticket-header">
      <div class="vip-chip">
        <span>VIP</span>
        <span>PASS</span>
      </div>
      <h1 class="ticket-title">Parking Pass</h1>
      <p class="ticket-subtitle">Premium parking access ticket</p>
    </div>
    <div class="ticket-body">
      <div class="ticket-block">
        <span class="ticket-label">Guest</span>
        <span class="ticket-value">${booking.userSnapshot?.name || 'Guest User'}</span>
        <div class="muted-line">${addressLine || 'Location details unavailable'}${pincodeLine ? ` • ${pincodeLine}` : ''}</div>
      </div>
      <div class="ticket-block">
        <span class="ticket-label">Booking Code</span>
        <span class="ticket-value">${booking.bookingReference || booking._id}</span>
      </div>
      <div class="ticket-meta">
        <div class="ticket-chip">
          <span class="ticket-label">Location</span>
          <strong>${booking.locationSnapshot?.locationName || 'Unknown'}</strong>
        </div>
        <div class="ticket-chip">
          <span class="ticket-label">Slot</span>
          <strong>${booking.locationSnapshot?.slotNumber || 'N/A'}</strong>
        </div>
      </div>
      <div class="ticket-meta-3">
        <div class="ticket-chip">
          <span class="ticket-label">Type</span>
          <strong>${slotTypeLabel}</strong>
        </div>
        <div class="ticket-chip">
          <span class="ticket-label">Vehicle</span>
          <strong>${String(booking.locationSnapshot?.vehicleType || booking.vehicleType || 'car').toUpperCase()}</strong>
        </div>
        <div class="ticket-chip">
          <span class="ticket-label">Floor</span>
          <strong>${booking.locationSnapshot?.floor || 1}</strong>
        </div>
      </div>
      <div class="ticket-meta">
        <div class="ticket-chip">
          <span class="ticket-label">Start</span>
          <strong>${formatDateTime(booking.startTime)}</strong>
        </div>
        <div class="ticket-chip">
          <span class="ticket-label">Duration</span>
          <strong>${booking.duration || 'N/A'} hr</strong>
        </div>
      </div>
      <div class="ticket-meta">
        <div class="ticket-chip">
          <span class="ticket-label">Status</span>
          <strong>${(booking.status || 'N/A').toUpperCase()}</strong>
        </div>
        <div class="ticket-chip">
          <span class="ticket-label">Paid</span>
          <strong>${formatCurrency(booking.pricing?.finalAmount)}</strong>
        </div>
      </div>
      <div class="ticket-divider">Admit One</div>
      <div class="barcode">
        <div class="barcode-line"></div>
        <div class="barcode-text">${booking.receiptNumber || booking._id}</div>
      </div>
      <div class="ticket-actions">
        <button class="button-secondary" onclick="window.close()">Close</button>
        <button class="button-primary" onclick="window.print()">Print</button>
      </div>
    </div>
  </article>
</body>
</html>`;

    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ParkNGo_VIP_Pass_${booking.receiptNumber || booking._id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-[44px] border border-white/10 bg-slate-950/95 shadow-[0_35px_70px_rgba(15,23,42,0.6)]">
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 px-6 pt-8 pb-10 text-center text-white">
          <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/90 shadow-[0_15px_40px_rgba(168,85,247,0.24)]">
              <FaTicketAlt className="h-4 w-4" /> VIP PASS
            </span>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Parking Pass</h2>
            <p className="mt-3 text-sm text-white/80">Premium access to your booking</p>
          </div>
        </div>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 pb-6 pt-6 [scrollbar-width:thin]">
          <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Guest</p>
                <p className="mt-3 truncate text-2xl font-semibold text-white">
                  {booking.userSnapshot?.name || 'Guest User'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                    <FaCalendarAlt className="h-3.5 w-3.5" />
                    {formatDateTime(booking.startTime)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                    <FaBarcode className="h-3.5 w-3.5" />
                    {booking.receiptNumber || booking._id}
                  </span>
                </div>
              </div>
              <div className="shrink-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 px-4 py-3 text-right text-white shadow-[0_18px_45px_rgba(168,85,247,0.24)]">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/80">Premium</p>
                <p className="mt-1 text-sm font-semibold">Admit One</p>
              </div>
            </div>
            <p className="mt-4 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(124,58,237,0.22)]">
              {booking.bookingReference || booking._id}
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Location</p>
              <p className="mt-3 text-lg font-semibold text-white">{booking.locationSnapshot?.locationName || 'Unknown Location'}</p>
              <p className="mt-2 flex items-start gap-2 text-sm text-slate-400">
                <FaMapMarkerAlt className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span className="leading-relaxed">
                  {safeJoin([booking.locationSnapshot?.area, booking.locationSnapshot?.city], ', ') || 'Address unavailable'}
                  {booking.locationSnapshot?.pincode ? ` • ${booking.locationSnapshot?.pincode}` : ''}
                </span>
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Slot</p>
                <p className="mt-3 text-xl font-semibold text-white">{booking.locationSnapshot?.slotNumber || 'N/A'}</p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Status</p>
                <p
                  className={`mt-3 inline-flex rounded-full px-3 py-2 text-sm font-semibold ${
                    booking.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : booking.status === 'confirmed'
                        ? 'bg-blue-500/15 text-blue-300'
                        : 'bg-slate-700/60 text-slate-200'
                  }`}
                >
                  {(booking.status || 'N/A').toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Start</p>
                <p className="mt-3 text-sm font-semibold text-white">{formatDateTime(booking.startTime)}</p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Duration</p>
                <p className="mt-3 text-sm font-semibold text-white">{booking.duration || 'N/A'} hr</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Slot type</p>
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  {String(booking.locationSnapshot?.slotType || '').toLowerCase() === 'ev' ? (
                    <FaBolt className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <FaCar className="h-4 w-4 text-slate-300" />
                  )}
                  {formatSlotType(booking.locationSnapshot?.slotType)}
                </p>
              </div>
              <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Floor</p>
                <p className="mt-3 text-sm font-semibold text-white">{booking.locationSnapshot?.floor || 1}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Total paid</p>
                <p className="mt-3 text-2xl font-semibold text-white">{formatCurrency(booking.pricing?.finalAmount)}</p>
              </div>
              <div className="rounded-3xl bg-white/5 px-4 py-3 text-right text-white ring-1 ring-white/10">
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">Type</p>
                <p className="mt-1 text-sm font-semibold text-white">{formatSlotType(booking.locationSnapshot?.slotType)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-slate-500">
            <span className="h-px flex-1 bg-white/10"></span>
            <span>Ticket</span>
            <span className="h-px flex-1 bg-white/10"></span>
          </div>

          <div className="rounded-[32px] border border-dashed border-white/10 bg-slate-900/90 p-5 text-center">
            <div className="mx-auto mb-4 mt-1 h-10 w-full max-w-[220px] rounded-2xl bg-gradient-to-r from-white/90 via-white/15 to-white/90"></div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Barcode</div>
            <div className="mt-3 text-sm font-medium tracking-[0.24em] text-slate-400">{booking.receiptNumber || booking._id}</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950/95 px-6 py-5 sm:flex-row">
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Close
          </button>
          <button
            onClick={downloadReceipt}
            className="rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(124,58,237,0.32)] transition hover:brightness-110"
          >
            Download Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
