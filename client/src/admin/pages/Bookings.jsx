import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { bookingsAPI } from '../../services/api';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingsAPI.getAll();
      setBookings(response.data?.data?.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsAPI.cancel(id);
        fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const columns = [
    { header: 'User', key: 'user', render: (row) => row.user.name },
    { header: 'Vehicle', key: 'vehicle', render: (row) => `${row.vehicle.licensePlate} (${row.vehicle.model})` },
    { header: 'Slot', key: 'slot', render: (row) => `${row.slot.slotNumber} - ${row.slot.location}` },
    { header: 'Start Time', key: 'startTime', render: (row) => new Date(row.startTime).toLocaleString() },
    { header: 'End Time', key: 'endTime', render: (row) => new Date(row.endTime).toLocaleString() },
    { header: 'Status', key: 'status', render: (row) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        row.status === 'active' ? 'bg-green-100 text-green-800' :
        row.status === 'completed' ? 'bg-blue-100 text-blue-800' :
        'bg-red-100 text-red-800'
      }`}>
        {row.status}
      </span>
    )},
    { header: 'Amount', key: 'totalAmount', render: (row) => `$${row.totalAmount}` },
    { header: 'Actions', key: 'actions', render: (row) => (
      <div className="flex space-x-2">
        <button
          onClick={() => setViewingBooking(row)}
          className="text-blue-600 hover:text-blue-800"
        >
          <FaEye />
        </button>
        {row.status === 'active' && (
          <button
            onClick={() => handleCancel(row.id)}
            className="text-red-600 hover:text-red-800"
          >
            <FaTrash />
          </button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={bookings}
          loading={loading}
          emptyMessage="No bookings found"
        />
      </Card>

      <Modal
        isOpen={!!viewingBooking}
        onClose={() => setViewingBooking(null)}
        title="Booking Details"
      >
        {viewingBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{viewingBooking.user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{viewingBooking.user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{viewingBooking.vehicle.licensePlate}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{viewingBooking.vehicle.model}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slot</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{viewingBooking.slot.slotNumber}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{viewingBooking.slot.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <span className={`mt-1 px-2 py-1 text-xs rounded-full ${
                  viewingBooking.status === 'active' ? 'bg-green-100 text-green-800' :
                  viewingBooking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {viewingBooking.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(viewingBooking.startTime).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(viewingBooking.endTime).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">${viewingBooking.totalAmount}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bookings;