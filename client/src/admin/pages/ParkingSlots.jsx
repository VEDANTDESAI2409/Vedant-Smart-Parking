import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCar, FaWheelchair } from 'react-icons/fa';
import { MdElectricBolt } from 'react-icons/md';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { slotsAPI } from '../../services/api';

const initialFormData = {
  city: '',
  area: '',
  pincode: '',
  landmark: '',
  vehicleType: 'car',
  slotType: 'normal',
  slotLocation: '',
  price: '',
};

const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setDebugInfo('');

      const response = await slotsAPI.getAll();

      console.log('GET /api/slots full response:', response);
      console.log('GET /api/slots response.data:', response.data);

      const responseData = response?.data;

      let apiSlots = [];

      if (Array.isArray(responseData?.data?.slots)) {
        apiSlots = responseData.data.slots;
      } else if (Array.isArray(responseData?.slots)) {
        apiSlots = responseData.slots;
      } else if (Array.isArray(responseData?.data)) {
        apiSlots = responseData.data;
      } else if (Array.isArray(responseData)) {
        apiSlots = responseData;
      }

      console.log('Parsed slots:', apiSlots);
      setSlots(apiSlots);

      setDebugInfo(
        `Fetched successfully. Total slots received: ${Array.isArray(apiSlots) ? apiSlots.length : 0}`
      );
    } catch (error) {
      console.error('Error fetching slots:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);

      setSlots([]);
      setDebugInfo(
        `Fetch failed: ${
          error?.response?.data?.message ||
          error?.message ||
          'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setEditingSlot(null);
    setFormData(initialFormData);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      city: slot.city || '',
      area: slot.area || '',
      pincode: slot.pincode || '',
      landmark: slot.landmark || '',
      vehicleType: slot.vehicleType || 'car',
      slotType: slot.slotType || 'normal',
      slotLocation: slot.slotLocation || '',
      price: slot.price ?? '',
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.city.trim()) return 'City is required';
    if (!formData.area.trim()) return 'Area is required';
    if (!/^\d{6}$/.test(formData.pincode.trim())) return 'Pincode must be 6 digits';
    if (!formData.landmark.trim()) return 'Landmark is required';
    if (!['car', 'bike'].includes(formData.vehicleType)) return 'Vehicle type must be car or bike';
    if (!['normal', 'ev', 'disabled'].includes(formData.slotType)) return 'Invalid slot type';
    if (!formData.slotLocation.trim()) return 'Slot location is required';
    if (formData.price === '' || Number.isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      return 'Enter a valid price';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    const payload = {
      city: formData.city.trim(),
      area: formData.area.trim(),
      pincode: formData.pincode.trim(),
      landmark: formData.landmark.trim(),
      vehicleType: formData.vehicleType,
      slotType: formData.slotType,
      slotLocation: formData.slotLocation.trim(),
      price: Number(formData.price),
    };

    try {
      setSubmitting(true);

      if (editingSlot) {
        await slotsAPI.update(editingSlot._id, payload);
      } else {
        await slotsAPI.create(payload);
      }

      await fetchSlots();
      setModalOpen(false);
      resetForm();
      alert(editingSlot ? 'Slot updated successfully' : 'Slot created successfully');
    } catch (error) {
      console.error('Error saving slot:', error);
      console.error('Server response:', error?.response?.data);

      const serverErrors = error?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        alert(serverErrors.map((item) => item.msg).join('\n'));
        return;
      }

      alert(error?.response?.data?.message || 'Failed to save slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;

    try {
      await slotsAPI.delete(id);
      await fetchSlots();
      alert('Slot deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error?.response?.data?.message || 'Failed to delete slot');
    }
  };

  const getVehicleBadge = (type) => (
    <span
      className={`px-3 py-1 text-xs rounded-full font-semibold capitalize ${
        type === 'car'
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      }`}
    >
      {type}
    </span>
  );

  const getSlotTypeBadge = (type) => {
    const config = {
      normal: {
        icon: <FaCar className="mr-1" />,
        style: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        label: 'Normal',
      },
      ev: {
        icon: <MdElectricBolt className="mr-1" />,
        style: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        label: 'EV',
      },
      disabled: {
        icon: <FaWheelchair className="mr-1" />,
        style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        label: 'Disabled',
      },
    };

    const item = config[type] || config.normal;

    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${item.style}`}>
        {item.icon}
        {item.label}
      </span>
    );
  };

  const columns = [
    { header: 'City', key: 'city' },
    { header: 'Area', key: 'area' },
    { header: 'Pincode', key: 'pincode' },
    { header: 'Landmark', key: 'landmark' },
    {
      header: 'Vehicle',
      key: 'vehicleType',
      render: (row) => getVehicleBadge(row.vehicleType),
    },
    {
      header: 'Slot Type',
      key: 'slotType',
      render: (row) => getSlotTypeBadge(row.slotType),
    },
    { header: 'Slot Location', key: 'slotLocation' },
    {
      header: 'Price',
      key: 'price',
      render: (row) => `₹${row.price}`,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-md"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-md"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Parking Slots</h1>
          <p className="text-sm text-gray-500 mt-1">{debugInfo}</p>
        </div>

        <Button onClick={openCreateModal}>
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
          if (!submitting) {
            setModalOpen(false);
            resetForm();
          }
        }}
        title={editingSlot ? 'Edit Slot' : 'Add Slot'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Area
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pincode
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Landmark
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slot Type
              </label>
              <select
                value={formData.slotType}
                onChange={(e) => handleInputChange('slotType', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="normal">Normal</option>
                <option value="ev">EV</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slot Location
              </label>
              <input
                type="text"
                value={formData.slotLocation}
                onChange={(e) => handleInputChange('slotLocation', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ParkingSlots;