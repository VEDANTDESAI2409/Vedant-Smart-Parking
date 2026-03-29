import React, { useEffect, useMemo, useState } from 'react';
import { FaCar, FaChevronRight, FaFileCsv, FaMapMarkerAlt, FaMotorcycle, FaSearch, FaUser } from 'react-icons/fa';

import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { bookingsAPI } from '../../services/api';

const toAdminBookingId = (booking, index) => {
  const raw = String(booking.bookingReference || booking._id || '').replace(/[^A-Z0-9]/gi, '');
  const suffix = raw.replace(/\D/g, '').slice(-3).padStart(3, '0');
  return `${booking.locationSnapshot?.vehicleType === 'bike' ? 'B' : 'C'}${suffix || String(index + 1).padStart(3, '0')}`;
};

const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(0)}`;

const mapStatus = (booking) => {
  if (booking.status === 'confirmed' || booking.status === 'active') return 'reserved';
  if (booking.status === 'pending') return 'processing';
  if (booking.status === 'completed') return 'completed';
  if (booking.status === 'cancelled') return 'cancelled';
  return booking.status || 'pending';
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getAll();
      const rawBookings = response?.data?.data?.bookings || [];
      const formatted = rawBookings.map((booking, index) => ({
        ...booking,
        customId: toAdminBookingId(booking, index),
        bookingDate: booking.startTime ? new Date(booking.startTime).toLocaleDateString() : '---',
        userName: booking.user?.name || 'Unknown User',
        mobileNumber: booking.user?.phone || '---',
        emailId: booking.user?.email || '---',
        vehicleType: booking.locationSnapshot?.vehicleType || booking.vehicle?.vehicleType || 'car',
        slotType: booking.locationSnapshot?.slotType || booking.parkingSlot?.slotType || 'normal',
        slotLocation: booking.locationSnapshot?.locationName || booking.parkingSlot?.location || '---',
        slotNumber: booking.locationSnapshot?.slotNumber || booking.parkingSlot?.slotNumber || '---',
        city: booking.locationSnapshot?.city || '---',
        area: booking.locationSnapshot?.area || '---',
        pincode: booking.locationSnapshot?.pincode || '---',
        landmark: booking.locationSnapshot?.locationName || '---',
        totalAmount: booking.pricing?.finalAmount || 0,
        status: mapStatus(booking),
        paymentStatus: booking.paymentStatus || 'pending',
      }));
      setBookings(formatted);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const intervalId = window.setInterval(fetchBookings, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  const filteredBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return bookings;
    return bookings.filter((booking) =>
      [
        booking.customId,
        booking.userName,
        booking.mobileNumber,
        booking.emailId,
        booking.slotLocation,
        booking.slotNumber,
        booking.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [bookings, searchTerm]);

  const handleExportCSV = () => {
    if (!filteredBookings.length) return;

    const headers = [
      'Booking ID',
      'Date',
      'Customer Name',
      'Mobile',
      'Email',
      'Vehicle Type',
      'Slot Type',
      'Slot Number',
      'Location',
      'City',
      'Area',
      'Pincode',
      'Status',
      'Amount',
      'Payment',
    ];

    const rows = filteredBookings.map((booking) =>
      [
        booking.customId,
        booking.bookingDate,
        `"${booking.userName}"`,
        booking.mobileNumber,
        booking.emailId,
        booking.vehicleType.toUpperCase(),
        booking.slotType,
        booking.slotNumber,
        `"${booking.slotLocation}"`,
        booking.city,
        `"${booking.area}"`,
        booking.pincode,
        booking.status.toUpperCase(),
        booking.totalAmount,
        booking.paymentStatus.toUpperCase(),
      ].join(',')
    );

    const blob = new Blob([[headers.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ParkNGo_Bookings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: 'BOOKING ID',
      render: (row) => (
        <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          {row.customId}
        </span>
      ),
    },
    {
      header: 'CUSTOMER',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 dark:text-gray-100">{row.userName}</span>
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{row.mobileNumber}</span>
        </div>
      ),
    },
    {
      header: 'VEHICLE',
      render: (row) => (
        <div className="flex items-center gap-2 text-sm font-semibold capitalize text-gray-600 dark:text-gray-400">
          <span className={`h-2 w-2 rounded-full ${row.vehicleType === 'bike' ? 'bg-blue-400' : 'bg-orange-400'}`} />
          {row.vehicleType}
        </div>
      ),
    },
    {
      header: 'SLOT',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{row.slotNumber}</span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{row.slotLocation}</span>
        </div>
      ),
    },
    {
      header: 'STATUS',
      render: (row) => (
        <span
          className={`rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${
            row.status === 'reserved'
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400'
              : row.status === 'processing'
                ? 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300'
                : row.status === 'completed'
                  ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300'
                  : 'bg-slate-50 text-slate-500 ring-slate-600/20 dark:bg-slate-800/50 dark:text-slate-400'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'AMOUNT',
      render: (row) => <span className="text-base font-black text-gray-900 dark:text-white">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      header: 'ACTION',
      render: (row) => (
        <button
          type="button"
          onClick={() => setViewingBooking(row)}
          className="group flex items-center gap-2 rounded-xl bg-[#1E293B] px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 dark:bg-blue-600"
        >
          VIEW DETAIL <FaChevronRight className="transition-transform group-hover:translate-x-1" size={10} />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans transition-colors duration-300 dark:bg-[#0F172A] lg:p-10">
      <div className="mb-8 flex flex-col items-end justify-between gap-6 md:flex-row">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Bookings</h1>
          <p className="font-medium text-slate-500 dark:text-slate-400">Live reservations created by users appear here automatically.</p>
        </div>

        <div className="flex w-full items-center gap-4 md:w-auto">
          <div className="group relative flex-grow md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by ID or name..."
              className="w-full rounded-2xl border-none bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:bg-[#1E293B] dark:text-white dark:ring-slate-700"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="rounded-2xl bg-white p-3.5 text-emerald-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 dark:bg-[#1E293B] dark:text-emerald-400 dark:ring-slate-700 dark:hover:bg-slate-800"
          >
            <FaFileCsv size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-[#1E293B] dark:shadow-none">
        <Table columns={columns} data={filteredBookings} loading={loading} emptyMessage="No bookings found" />
      </div>

      <Modal isOpen={!!viewingBooking} onClose={() => setViewingBooking(null)}>
        {viewingBooking ? (
          <div className="bg-white p-2 text-gray-900 dark:bg-[#1E293B] dark:text-gray-100">
            <div className="mb-8 flex items-start justify-between border-b pb-6 dark:border-slate-700">
              <div>
                <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-blue-500 dark:bg-blue-900/30">
                  Reservation Record
                </span>
                <h2 className="mt-2 text-3xl font-black">{viewingBooking.customId}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Booking Date</p>
                <p className="font-bold">{viewingBooking.bookingDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-8">
                <section>
                  <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-sm font-bold dark:border-slate-700">
                    <FaUser className="text-blue-500" /> Customer Profile
                  </h3>
                  <div className="space-y-3">
                    <ModalField label="Full Name" value={viewingBooking.userName} />
                    <ModalField label="Mobile" value={viewingBooking.mobileNumber} />
                    <ModalField label="Email" value={viewingBooking.emailId} />
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-sm font-bold dark:border-slate-700">
                    <FaCar className="text-blue-500" /> Vehicle & Slot Info
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <ModalField label="Vehicle Type" value={viewingBooking.vehicleType} isCaps />
                    <ModalField label="Class" value={viewingBooking.slotType} />
                    <ModalField label="Location" value={viewingBooking.slotLocation} />
                    <ModalField label="Slot No" value={viewingBooking.slotNumber} />
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-800/50">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                    <FaMapMarkerAlt className="text-blue-500" /> Location Pin
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <ModalField label="City" value={viewingBooking.city} />
                    <ModalField label="Pincode" value={viewingBooking.pincode} />
                    <ModalField label="Area" value={viewingBooking.area} span={2} />
                    <ModalField label="Landmark" value={viewingBooking.landmark} span={2} />
                  </div>
                </section>

                <div className="flex items-center justify-between rounded-3xl bg-blue-600 p-6 text-white shadow-lg shadow-blue-200 dark:shadow-none">
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-70">Payment Status</p>
                    <p className="text-xl font-black uppercase">{viewingBooking.paymentStatus}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase opacity-70">Total Amount</p>
                    <p className="text-4xl font-black">{formatCurrency(viewingBooking.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

const ModalField = ({ label, value, span = 1, isCaps = false }) => (
  <div className={span === 2 ? 'col-span-2' : 'col-span-1'}>
    <p className="mb-1 text-[10px] font-bold uppercase leading-none tracking-tighter text-slate-400 dark:text-slate-500">{label}</p>
    <p className={`font-bold dark:text-gray-100 ${isCaps ? 'uppercase' : ''}`}>{value || '---'}</p>
  </div>
);

export default Bookings;
