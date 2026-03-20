import React, { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import SearchableSelect from '../../components/SearchableSelect';
import Table from '../../components/Table';
import {
  areasAPI,
  citiesAPI,
  locationsAPI,
  pincodesAPI,
  slotsAPI,
} from '../../services/api';
import { shouldConfirmBulkDelete } from '../../utils/adminPreferences';
import { showError, showSuccess, showWarning } from '../../utils/toastService';

const getCollection = (response, key) =>
  response?.data?.data?.[key] ||
  response?.data?.[key] ||
  response?.data?.data ||
  response?.data ||
  [];

const getId = (value) => value?._id || value || '';
const getCityName = (item) => item?.cityId?.name || item?.city || item?.name || '';
const getPincodeValue = (item) => item?.pincodeId?.pincode || item?.pincode || '';
const getAreaValue = (item) => item?.areaId?.name || item?.area || item?.name || '';
const getLocationValue = (item) => item?.locationId?.name || item?.location || item?.name || '';
const mapOptions = (items, getLabel) =>
  items.map((item) => ({
    value: item._id,
    label: getLabel(item),
  }));

const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [locations, setLocations] = useState([]);

  const [cityId, setCityId] = useState('');
  const [pincodeId, setPincodeId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [landmark, setLandmark] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [slotType, setSlotType] = useState('normal');
  const [slotLocation, setSlotLocation] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    setSelectedSlotIds((prev) => prev.filter((id) => slots.some((item) => item._id === id)));
  }, [slots]);

  useEffect(() => {
    if (modalOpen) {
      fetchCities();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!cityId) {
      setPincodes([]);
      return;
    }

    fetchPincodes(cityId);
  }, [cityId]);

  useEffect(() => {
    if (!cityId || !pincodeId) {
      setAreas([]);
      return;
    }

    fetchAreas(cityId, pincodeId);
  }, [cityId, pincodeId]);

  useEffect(() => {
    if (!cityId || !pincodeId || !areaId) {
      setLocations([]);
      return;
    }

    fetchLocations(cityId, pincodeId, areaId);
  }, [cityId, pincodeId, areaId]);

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

  const fetchPincodes = async (selectedCityId) => {
    try {
      const response = await pincodesAPI.getAll({ cityId: selectedCityId });
      const list = getCollection(response, 'pincodes');
      setPincodes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
    }
  };

  const fetchAreas = async (selectedCityId, selectedPincodeId) => {
    try {
      const response = await areasAPI.getAll({
        cityId: selectedCityId,
        pincodeId: selectedPincodeId,
      });
      const list = getCollection(response, 'areas');
      setAreas(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    }
  };

  const fetchLocations = async (selectedCityId, selectedPincodeId, selectedAreaId) => {
    try {
      const response = await locationsAPI.getAll({
        cityId: selectedCityId,
        pincodeId: selectedPincodeId,
        areaId: selectedAreaId,
      });
      const list = getCollection(response, 'locations');
      setLocations(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    }
  };

  const resetForm = () => {
    setEditingSlot(null);
    setCityId('');
    setPincodeId('');
    setAreaId('');
    setLocationId('');
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
    setCityId(value);
    setPincodeId('');
    setAreaId('');
    setLocationId('');
    setPincodes([]);
    setAreas([]);
    setLocations([]);
  };

  const handlePincodeChange = (value) => {
    setPincodeId(value);
    setAreaId('');
    setLocationId('');
    setAreas([]);
    setLocations([]);
  };

  const handleAreaChange = (value) => {
    setAreaId(value);
    setLocationId('');
    setLocations([]);
  };

  const handleEdit = async (slot) => {
    setEditingSlot(slot);
    setLandmark(slot.landmark || '');
    setVehicleType(slot.vehicleType || 'car');
    setSlotType(slot.slotType || 'normal');
    setSlotLocation(slot.slotLocation || '');
    setPrice(slot.price ?? '');
    setModalOpen(true);

    try {
      const citiesResponse = await citiesAPI.getAll();
      const cityList = getCollection(citiesResponse, 'cities');
      setCities(Array.isArray(cityList) ? cityList : []);

      const matchedCity = cityList.find((item) => item.name === slot.city);
      const matchedCityId = matchedCity?._id || '';
      setCityId(matchedCityId);

      if (!matchedCityId) {
        return;
      }

      const pincodesResponse = await pincodesAPI.getAll({ cityId: matchedCityId });
      const pincodeList = getCollection(pincodesResponse, 'pincodes');
      setPincodes(Array.isArray(pincodeList) ? pincodeList : []);

      const matchedPincode = pincodeList.find((item) => item.pincode === slot.pincode);
      const matchedPincodeId = matchedPincode?._id || '';
      setPincodeId(matchedPincodeId);

      if (!matchedPincodeId) {
        return;
      }

      const areasResponse = await areasAPI.getAll({
        cityId: matchedCityId,
        pincodeId: matchedPincodeId,
      });
      const areaList = getCollection(areasResponse, 'areas');
      setAreas(Array.isArray(areaList) ? areaList : []);

      const matchedArea = areaList.find((item) => item.name === slot.area);
      const matchedAreaId = matchedArea?._id || '';
      setAreaId(matchedAreaId);

      if (!matchedAreaId) {
        return;
      }

      const locationsResponse = await locationsAPI.getAll({
        cityId: matchedCityId,
        pincodeId: matchedPincodeId,
        areaId: matchedAreaId,
      });
      const locationList = getCollection(locationsResponse, 'locations');
      setLocations(Array.isArray(locationList) ? locationList : []);

      const matchedLocation = locationList.find((item) => item.name === slot.location);
      setLocationId(matchedLocation?._id || '');
    } catch (error) {
      console.error('Error loading dependent slot values for edit:', error);
    }
  };

  const validateForm = () => {
    if (!cityId) return 'City is required';
    if (!pincodeId) return 'Pincode is required';
    if (!areaId) return 'Area is required';
    if (!locationId) return 'Location is required';
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
      showWarning(validationError);
      return;
    }

    const selectedCity = cities.find((item) => item._id === cityId);
    const selectedPincode = pincodes.find((item) => item._id === pincodeId);
    const selectedArea = areas.find((item) => item._id === areaId);
    const selectedLocation = locations.find((item) => item._id === locationId);

    if (!selectedCity || !selectedPincode || !selectedArea || !selectedLocation) {
      showWarning('Please reselect city, pincode, area, and location');
      return;
    }

    const payload = {
      city: selectedCity.name,
      pincode: selectedPincode.pincode,
      area: selectedArea.name,
      location: selectedLocation.name,
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
      showSuccess(editingSlot ? 'Slot updated successfully' : 'Slot created successfully');
    } catch (error) {
      console.error('Error saving slot:', error);
      const serverErrors = error?.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        showError(serverErrors.map((item) => item.msg).join(', '));
        return;
      }
      showError(error?.response?.data?.message || 'Failed to save slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Slot?',
      text: 'This parking slot will be removed from the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      background: '#ffffff',
      color: '#0f172a',
      borderRadius: '12px',
    });

    if (!result.isConfirmed) return;

    try {
      await slotsAPI.delete(id);
      await fetchSlots();
      showSuccess('Slot deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      showError(error?.response?.data?.message || 'Failed to delete slot');
    }
  };

  const handleSlotSelect = (id, checked) => {
    setSelectedSlotIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((selectedId) => selectedId !== id)
    );
  };

  const handleSelectAllSlots = (checked) => {
    setSelectedSlotIds(checked ? slots.map((item) => item._id).filter(Boolean) : []);
  };

  const handleBulkDelete = async () => {
    if (!selectedSlotIds.length) {
      showWarning('Please select at least one slot');
      return;
    }

    if (shouldConfirmBulkDelete()) {
      const result = await Swal.fire({
        title: 'Delete Selected Slots?',
        text: `Delete ${selectedSlotIds.length} selected parking slots? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete All',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '12px',
      });

      if (!result.isConfirmed) return;
    }

    try {
      const results = await Promise.allSettled(selectedSlotIds.map((id) => slotsAPI.delete(id)));
      const successCount = results.filter((item) => item.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      await fetchSlots();
      setSelectedSlotIds([]);

      if (successCount) {
        showSuccess(
          failureCount
            ? `${successCount} slots deleted, ${failureCount} failed`
            : `${successCount} slots deleted successfully`
        );
      } else {
        showError('Failed to delete selected slots');
      }
    } catch (error) {
      console.error('Bulk slot delete error:', error);
      showError('Failed to delete selected slots');
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
      render: (row) => `Rs ${row.price ?? 0}`,
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

  const cityOptions = mapOptions(cities, (item) => item.name);
  const pincodeOptions = mapOptions(pincodes, (item) => item.pincode);
  const areaOptions = mapOptions(areas, (item) => item.name);
  const locationOptions = mapOptions(locations, (item) => item.name);
  const vehicleTypeOptions = [
    { value: 'car', label: 'Car' },
    { value: 'bike', label: 'Bike' },
  ];
  const slotTypeOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'vip', label: 'VIP' },
    { value: 'reserved', label: 'Reserved' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Parking Slots</h1>
          <p className="text-sm text-gray-500 mt-1">Create slots with dependent location mapping.</p>
        </div>

        <div className="flex gap-3">
          {selectedSlotIds.length > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              <FaTrash className="mr-2" />
              Delete Selected ({selectedSlotIds.length})
            </Button>
          )}
          <Button onClick={openCreateModal}>
            <FaPlus className="mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={slots}
          loading={loading}
          emptyMessage="No parking slots found"
          selectable
          selectedRowIds={selectedSlotIds}
          onRowSelect={handleSlotSelect}
          onSelectAll={handleSelectAllSlots}
          getRowId={(row) => row._id}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
              <SearchableSelect
                value={cityId}
                onChange={handleCityChange}
                options={cityOptions}
                placeholder="Select a city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
              <SearchableSelect
                value={pincodeId}
                onChange={handlePincodeChange}
                options={pincodeOptions}
                placeholder={!cityId ? 'Select a city first' : 'Select a pincode'}
                disabled={!cityId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area</label>
              <SearchableSelect
                value={areaId}
                onChange={handleAreaChange}
                options={areaOptions}
                placeholder={!pincodeId ? 'Select a pincode first' : 'Select an area'}
                disabled={!pincodeId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <SearchableSelect
                value={locationId}
                onChange={setLocationId}
                options={locationOptions}
                placeholder={!areaId ? 'Select an area first' : 'Select a location'}
                disabled={!areaId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Type</label>
              <SearchableSelect
                value={vehicleType}
                onChange={setVehicleType}
                options={vehicleTypeOptions}
                placeholder="Select a vehicle type"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slot Type</label>
              <SearchableSelect
                value={slotType}
                onChange={setSlotType}
                options={slotTypeOptions}
                placeholder="Select a slot type"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slot Location</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
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
