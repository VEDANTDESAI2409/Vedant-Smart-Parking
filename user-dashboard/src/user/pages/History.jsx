import React, { useEffect, useState } from 'react';
import { bookingsAPI } from '../../services/api';

const History = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await bookingsAPI.getMine();
        const bookings = response.data.data.bookings || [];
        setItems(bookings.filter((booking) => ['confirmed', 'completed', 'cancelled'].includes(booking.status)));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fdf9_0%,#eef8f3_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_24px_70px_rgba(17,31,26,0.08)]">
          <h1 className="text-3xl font-semibold text-[var(--color-secondary)]">Booking History</h1>
          <p className="mt-2 text-slate-600">Review confirmed bookings, cancellations, and receipt-ready booking records.</p>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-[28px] border border-[rgba(64,138,113,0.14)] bg-white px-5 py-10 text-center text-slate-500">
              Loading history...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[28px] border border-[rgba(64,138,113,0.14)] bg-white px-5 py-10 text-center text-slate-500">
              No booking history available yet.
            </div>
          ) : (
            items.map((booking) => (
              <div key={booking._id} className="rounded-[28px] border border-[rgba(64,138,113,0.14)] bg-white p-6 shadow-[0_14px_40px_rgba(17,31,26,0.05)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-[var(--color-secondary)]">{booking.locationSnapshot?.locationName || 'Parking Location'}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.locationSnapshot?.area}, {booking.locationSnapshot?.city} {booking.locationSnapshot?.pincode}
                    </p>
                  </div>
                  <div className="rounded-full bg-[rgba(176,228,204,0.18)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                    {booking.status}
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Receipt</p>
                    <p className="mt-1 font-semibold">{booking.receiptNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Slot</p>
                    <p className="mt-1 font-semibold">{booking.locationSnapshot?.slotNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Start</p>
                    <p className="mt-1 font-semibold">{new Date(booking.startTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Paid</p>
                    <p className="mt-1 font-semibold">INR {booking.pricing?.finalAmount}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
