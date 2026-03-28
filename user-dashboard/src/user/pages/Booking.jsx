import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCar, FaCreditCard } from 'react-icons/fa';

const Booking = () => {
  const [bookings] = useState([
    {
      id: 1,
      spot: 'Downtown Parking Lot A - Slot 001',
      location: '123 Main St, Downtown',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T12:00:00Z',
      status: 'active',
      totalAmount: 10.00,
      vehicle: 'Toyota Camry (ABC-123)',
    },
    {
      id: 2,
      spot: 'Central Garage - Slot 005',
      location: '456 Central Ave',
      startTime: '2024-01-14T14:00:00Z',
      endTime: '2024-01-14T16:00:00Z',
      status: 'completed',
      totalAmount: 15.00,
      vehicle: 'Honda Civic (XYZ-789)',
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FaCalendarAlt className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">My Bookings</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Parking Bookings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your parking reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You haven't made any parking reservations yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{booking.spot}</h3>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <FaMapMarkerAlt className="mr-1" />
                      {booking.location}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaClock className="mr-2" />
                    <div>
                      <div>Start: {new Date(booking.startTime).toLocaleString()}</div>
                      <div>End: {new Date(booking.endTime).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaCar className="mr-2" />
                    {booking.vehicle}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FaCreditCard className="mr-2" />
                    <span className="font-semibold">${booking.totalAmount}</span>
                  </div>
                </div>

                {booking.status === 'active' && (
                  <div className="flex space-x-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                      Extend Booking
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Booking;