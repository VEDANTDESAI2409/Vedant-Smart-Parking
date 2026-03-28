import React, { useState } from 'react';
import { FaHistory, FaCalendarAlt, FaMapMarkerAlt, FaCar, FaCreditCard } from 'react-icons/fa';

const History = () => {
  const [history] = useState([
    {
      id: 1,
      spot: 'Downtown Parking Lot A - Slot 001',
      location: '123 Main St, Downtown',
      startTime: '2024-01-10T10:00:00Z',
      endTime: '2024-01-10T12:00:00Z',
      status: 'completed',
      totalAmount: 10.00,
      vehicle: 'Toyota Camry (ABC-123)',
      paymentMethod: 'Credit Card',
    },
    {
      id: 2,
      spot: 'Central Garage - Slot 005',
      location: '456 Central Ave',
      startTime: '2024-01-09T14:00:00Z',
      endTime: '2024-01-09T16:00:00Z',
      status: 'completed',
      totalAmount: 15.00,
      vehicle: 'Honda Civic (XYZ-789)',
      paymentMethod: 'PayPal',
    },
    {
      id: 3,
      spot: 'Mall Parking - Slot 012',
      location: '789 Shopping Blvd',
      startTime: '2024-01-08T09:00:00Z',
      endTime: '2024-01-08T17:00:00Z',
      status: 'cancelled',
      totalAmount: 40.00,
      vehicle: 'Toyota Camry (ABC-123)',
      paymentMethod: 'Credit Card',
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
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
              <FaHistory className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Booking History</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Parking History</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">View all your past parking reservations</p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No history found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your parking history will appear here
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Bookings</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((booking) => (
                <div key={booking.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{booking.spot}</h4>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <FaMapMarkerAlt className="mr-1" />
                        {booking.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(booking.startTime).toLocaleDateString()} - {new Date(booking.endTime).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FaCar className="mr-2" />
                      {booking.vehicle}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <FaCreditCard className="mr-2" />
                      {booking.paymentMethod} - ${booking.totalAmount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Duration: {Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60))} hours
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;