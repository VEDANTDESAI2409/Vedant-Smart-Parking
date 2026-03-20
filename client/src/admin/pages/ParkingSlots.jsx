import React, { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';

import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import {
  areasAPI,
  citiesAPI,
  locationsAPI,
  pincodesAPI,
  slotsAPI,
} from '../../services/api';

const getCollection = (response, key) =>
  response?.data?.data?.[key] ||
  response?.data?.[key] ||
  response?.data?.data ||
  response?.data ||
  [];

const getCityName = (item) => item?.city || item?.cityId || '';
const getPincodeValue = (item) => item?.pincode || item?.pincodeId || '';
const getAreaValue = (item) => item?.area || item?.areaId || '';
const getLocationValue = (item) => item?.location || item?.locationId || item?.name || '';

const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [locations, setLocations] = useState([]);

  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [slotType, setSlotType] = useState('normal');
  const [slotLocation, setSlotLocation] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      fetchCities();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!city) {
      setPincodes([]);
      return;
    }
    fetchPincodes(city);
  }, [city]);

  useEffect(() => {
    if (!pincode) {
      setAreas([]);
      return;
    }
    fetchAreas(pincode);
  }, [pincode]);

  useEffect(() => {
    if (!area) {
      setLocations([]);
      return;
    }
    fetchLocations(area);
  }, [area]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await slotsAPI.getAll();
      const list = getCollection(response, 'slots');
      setSlots(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await citiesAPI.getAll();
      const list = getCollection(response, 'cities');
      setCities(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  const fetchPincodes = async (selectedCity) => {
    try {
      const response = await pincodesAPI.getAll();
      let list = getCollection(response, 'pincodes');
      list = list.filter((item) => getCityName(item) === selectedCity);
      setPincodes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
    }
  };

  const fetchAreas = async (selectedPincode) => {
    try {
      const response = await areasAPI.getAll();
      let list = getCollection(response, 'areas');
      list = list.filter((item) => getPincodeValue(item) === selectedPincode);
      setAreas(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    }
  };

  const fetchLocations = async (selectedArea) => {
    try {
      const response = await locationsAPI.getAll();
      let list = getCollection(response, 'locations');
      list = list.filter((item) => getAreaValue(item) === selectedArea);
      setLocations(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    }
  };

  const resetForm = () => {
    setEditingSlot(null);
    setCity('');
    setPincode('');
    setArea('');
    setLocation('');
    setLandmark('');
    setVehicleType('car');
    setSlotType('normal');
    setSlotLocation('');
    setPrice('');
    setPincodes([]);
    setAreas([]);
    setLocations([]);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleCityChange = (value) => {
    setCity(value);
    setPincode('');
    setArea('');
    setLocation('');
    setPincodes([]);
    setAreas([]);
    setLocations([]);
  };

  const handlePincodeChange = (value) => {
    setPincode(value);
    setArea('');
    setLocation('');
    setAreas([]);
    setLocations([]);
  };

  const handleAreaChange = (value) => {
    setArea(value);
    setLocation('');
    setLocations([]);
  };

  const handleEdit = async (slot) => {
    const slotCity = getCityName(slot);
    const slotPincode = getPincodeValue(slot);
    const slotArea = getAreaValue(slot);

    setEditingSlot(slot);
    setCity(slotCity);
    setPincode(slotPincode);
    setArea(slotArea);
    setLocation(getLocationValue(slot));
    setLandmark(slot.landmark || '');
    setVehicleType(slot.vehicleType || 'car');
    setSlotType(slot.slotType || 'normal');
    setSlotLocation(slot.slotLocation || '');
    setPrice(slot.price ?? '');
    setModalOpen(true);

    if (slotCity) {
      await fetchPincodes(slotCity);
    }
    if (slotPincode) {
      await fetchAreas(slotPincode);
    }
    if (slotArea) {
      await fetchLocations(slotArea);
    }
  };

  const validateForm = () => {
    if (!city) return 'City is required';
    if (!pincode) return 'Pincode is required';
    if (!area) return 'Area is required';
    if (!location) return 'Location is required';
    if (!landmark.trim()) return 'Landmark is required';
    if (!slotLocation.trim()) return 'Slot location is required';
    if (price === '' || Number.isNaN(Number(price)) || Number(price) < 0) {
      return 'Price must be a valid positive number';
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
      city,
      pincode,
      area,
      location,
      landmark: landmark.trim(),
      vehicleType,
      slotType,
      slotLocation: slotLocation.trim(),
      price: Number(price),
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

  const columns = [
    { header: 'City', key: 'city' },
    { header: 'Pincode', key: 'pincode' },
    { header: 'Area', key: 'area' },
    { header: 'Location', key: 'location' },
    { header: 'Landmark', key: 'landmark' },
    {
      header: 'Vehicle Type',
      key: 'vehicleType',
      render: (row) => <span className="capitalize">{row.vehicleType || 'N/A'}</span>,
    },
    {
      header: 'Slot Type',
      key: 'slotType',
      render: (row) => <span className="capitalize">{row.slotType || 'N/A'}</span>,
    },
    { header: 'Slot Location', key: 'slotLocation' },
    {
      header: 'Price',
      key: 'price',
      render: (row) => `₹${row.price ?? 0}`,
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
          <p className="text-sm text-gray-500 mt-1">Create slots with dependent location mapping.</p>
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
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select a city</option>
                {cities.map((item) => (
                  <option key={item._id || item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pincode
              </label>
              <select
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                disabled={!city}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-900/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">{!city ? 'Select a city first' : 'Select a pincode'}</option>
                {pincodes.map((item) => (
                  <option key={item._id || item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Area
              </label>
              <select
                value={area}
                onChange={(e) => handleAreaChange(e.target.value)}
                disabled={!pincode}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-900/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">{!pincode ? 'Select a pincode first' : 'Select an area'}</option>
                {areas.map((item) => (
                  <option key={item._id || item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={!area}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-900/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">{!area ? 'Select an area first' : 'Select a location'}</option>
                {locations.map((item) => (
                  <option key={item._id || item.name} value={item.name}>
                    {item.name}
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
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
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
                value={slotType}
                onChange={(e) => setSlotType(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="normal">Normal</option>
                <option value="vip">VIP</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slot Location
              </label>
              <input
                type="text"
                value={slotLocation}
                onChange={(e) => setSlotLocation(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g. Floor 1, Section B"
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
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
