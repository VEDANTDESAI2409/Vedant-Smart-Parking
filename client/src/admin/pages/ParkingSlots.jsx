import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { slotsAPI } from '../../services/api';

const ParkingSlots = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    slotNumber: '',
    location: '',
    type: 'standard',
    status: 'available',
    pricePerHour: '',
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await slotsAPI.getAll();
      if (response.data?.data?.slots) {
        setSlots(response.data.data.slots);
      } else {
        console.error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Dummy data for development
      setSlots([
        {
          id: 1,
          slotNumber: 'A001',
          location: 'Floor 1, Section A',
          type: 'standard',
          status: 'occupied',
          pricePerHour: 5.00,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          slotNumber: 'A002',
          location: 'Floor 1, Section A',
          type: 'premium',
          status: 'available',
          pricePerHour: 8.00,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 3,
          slotNumber: 'B001',
          location: 'Floor 1, Section B',
          type: 'standard',
          status: 'maintenance',
          pricePerHour: 5.00,
          createdAt: '2024-01-15T10:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await slotsAPI.update(editingSlot.id, formData);
      } else {
        await slotsAPI.create(formData);
      }
      fetchSlots();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving slot:', error);
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      slotNumber: slot.slotNumber,
      location: slot.location,
      type: slot.type,
      status: slot.status,
      pricePerHour: slot.pricePerHour,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking slot?')) {
      try {
        await slotsAPI.delete(id);
        fetchSlots();
      } catch (error) {
        console.error('Error deleting slot:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingSlot(null);
    setFormData({
      slotNumber: '',
      location: '',
      type: 'standard',
      status: 'available',
      pricePerHour: '',
    });
  };

  const columns = [
    { header: 'Slot Number', key: 'slotNumber' },
    { header: 'Location', key: 'location' },
    { header: 'Type', key: 'type', render: (row) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        row.type === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {row.type}
      </span>
    )},
    { header: 'Status', key: 'status', render: (row) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        row.status === 'available' ? 'bg-green-100 text-green-800' :
        row.status === 'occupied' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {row.status}
      </span>
    )},
    { header: 'Price/Hour', key: 'pricePerHour', render: (row) => `$${row.pricePerHour}` },
    { header: 'Actions', key: 'actions', render: (row) => (
      <div className="flex space-x-2">
        <button
          onClick={() => handleEdit(row)}
          className="text-blue-600 hover:text-blue-800"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => handleDelete(row.id)}
          className="text-red-600 hover:text-red-800"
        >
          <FaTrash />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parking Slots</h1>
        <Button onClick={() => setModalOpen(true)}>
          <FaPlus className="mr-2" />
          Add Slot
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={slots}
          loading={loading}
          emptyMessage="No parking slots found"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editingSlot ? 'Edit Parking Slot' : 'Add Parking Slot'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slot Number
            </label>
            <input
              type="text"
              value={formData.slotNumber}
              onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price per Hour ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingSlot ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ParkingSlots;