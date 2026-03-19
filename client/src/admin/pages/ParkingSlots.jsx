import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCar, FaWheelchair } from 'react-icons/fa';
import { MdElectricBolt } from 'react-icons/md';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import {
  slotsAPI,
  citiesAPI,
  pincodesAPI,
  areasAPI,
  locationsAPI,
} from '../../services/api';

const initialFormData = {
  city: '',
  pincode: '',
  area: '',
  location: '',
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

  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      fetchCities();
    }
  }, [modalOpen]);

  useEffect(() => {
    // whenever the selected city changes, reset child selections
    if (!formData.city) {
      setPincodes([]);
      setFormData((prev) => ({ ...prev, pincode: '', area: '', location: '' }));
      return;
    }

    fetchPincodes(formData.city);
  }, [formData.city]);

  useEffect(() => {
    if (!formData.pincode) {
      setAreas([]);
      setFormData((prev) => ({ ...prev, area: '', location: '' }));
      return;
    }

    fetchAreas(formData.pincode);
  }, [formData.pincode]);

  useEffect(() => {
    if (!formData.area) {
      setLocations([]);
      setFormData((prev) => ({ ...prev, location: '' }));
      return;
    }

    fetchLocations(formData.area);
  }, [formData.area]);

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

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const response = await citiesAPI.getAll();
      const list = response?.data?.data?.cities || [];
      setCities(list);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchPincodes = async (cityValue) => {
    try {
      setLoadingPincodes(true);
      const response = await pincodesAPI.getAll();
      let list = response?.data?.data?.pincodes || [];

      // Filter by city if possible
      if (cityValue) {
        list = list.filter((item) => {
          // Support both field names `city` and `cityId`
          if (item.city) return item.city === cityValue;
          if (item.cityId) return item.cityId === cityValue;
          return true;
        });
      }

      setPincodes(list);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
    } finally {
      setLoadingPincodes(false);
    }
  };

  const fetchAreas = async (pincodeValue) => {
    try {
      setLoadingAreas(true);
      const response = await areasAPI.getAll();
      let list = response?.data?.data?.areas || [];

      if (pincodeValue) {
        list = list.filter((item) => {
          if (item.pincode) return item.pincode === pincodeValue;
          if (item.pincodeId) return item.pincodeId === pincodeValue;
          return true;
        });
      }

      setAreas(list);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  const fetchLocations = async (areaValue) => {
    try {
      setLoadingLocations(true);
      const response = await locationsAPI.getAll();
      let list = response?.data?.data?.locations || [];

      if (areaValue) {
        list = list.filter((item) => {
          if (item.area) return item.area === areaValue;
          if (item.areaId) return item.areaId === areaValue;
          return true;
        });
      }

      setLocations(list);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setLoadingLocations(false);
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
      city: slot.city || slot.cityId || '',
      pincode: slot.pincode || slot.pincodeId || '',
      area: slot.area || slot.areaId || '',
      location: slot.location || slot.locationId || '',
      landmark: slot.landmark || '',
      vehicleType: slot.vehicleType || 'car',
      slotType: slot.slotType || 'normal',
      slotLocation: slot.slotLocation || '',
      price: slot.price ?? '',
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.city) return 'City is required';
    if (!formData.pincode) return 'Pincode is required';
    if (!formData.area) return 'Area is required';
    if (!formData.location) return 'Location is required';
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
      city: formData.city,
      pincode: formData.pincode,
      area: formData.area,
      location: formData.location,
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
              <select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city._id || city.name} value={city._id || city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pincode
              </label>
              <select
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                disabled={!formData.city}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-900/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">{!formData.city ? 'Select a city first' : 'Select a pincode'}</option>
                {pincodes.map((pincode) => (
                  <option key={pincode._id || pincode.name} value={pincode._id || pincode.name}>
                    {pincode.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Area
              </label>
              <select
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                disabled={!formData.pincode}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-900/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">{!formData.pincode ? 'Select a pincode first' : 'Select an area'}</option>
                {areas.map((area) => (
                  <option key={area._id || area.name} value={area._id || area.name}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!formData.area}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-900/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">{!formData.area ? 'Select an area first' : 'Select a location'}</option>
                {locations.map((location) => (
                  <option key={location._id || location.name} value={location._id || location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
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