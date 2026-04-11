import React, { useEffect, useState } from 'react';
import { bookingsAPI } from '../../services/api';

const toShortBookingId = (value) => {
  const normalized = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const digitsOnly = normalized.replace(/\D/g, '');
  const suffix = (digitsOnly || normalized).slice(-4).padStart(4, '0');
  return `BK${suffix}`;
};

const Booking = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await bookingsAPI.getMine();
        setItems(response.data.data.bookings || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_24px_70px_rgba(17,31,26,0.08)]">
          <h1 className="text-3xl font-semibold text-[var(--color-secondary)]">My Bookings</h1>
          <p className="mt-2 text-slate-600">Track active, pending, and paid bookings from the live booking flow.</p>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-[28px] border border-[rgba(14,165,233,0.14)] bg-white px-5 py-10 text-center text-slate-500">
              Loading bookings...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[28px] border border-[rgba(14,165,233,0.14)] bg-white px-5 py-10 text-center text-slate-500">
              No bookings yet.
            </div>
          ) : (
            items.map((booking) => {
              const slotNumber = booking.locationSnapshot?.slotNumber || booking.parkingSlot?.slotNumber || '---';
              const floorNumber = booking.locationSnapshot?.floor || booking.parkingSlot?.floor || '---';

              return (
                <div key={booking._id} className="rounded-[28px] border border-[rgba(14,165,233,0.14)] bg-white p-6 shadow-[0_14px_40px_rgba(17,31,26,0.05)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-[var(--color-secondary)]">
                        {booking.locationSnapshot?.locationName || 'Parking Location'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Slot {slotNumber} • Floor {floorNumber}
                      </p>
                    </div>
                    <div className="rounded-full bg-[rgba(186,230,253,0.18)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                      {booking.status}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Booking ID</p>
                      <p className="mt-1 font-semibold">{toShortBookingId(booking.bookingReference)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Booked Slot</p>
                      <p className="mt-1 font-semibold">{slotNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Date & Time</p>
                      <p className="mt-1 font-semibold">{new Date(booking.startTime).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Duration</p>
                      <p className="mt-1 font-semibold">{booking.duration} hr</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Amount</p>
                      <p className="mt-1 font-semibold">INR {booking.pricing?.finalAmount}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;

