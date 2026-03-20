import React, { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaFileImport, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import SearchableSelect from '../../components/SearchableSelect';
import DataImportModal from '../components/DataImportModal';
import { areasAPI, citiesAPI, locationsAPI, pincodesAPI } from '../../services/api';
import { showError, showSuccess, showWarning } from '../../utils/toastService';

const initialFormData = {
  cityId: '',
  pincodeId: '',
  areaId: '',
  name: '',
  lat: '',
  lng: '',
  status: true,
};

const getLocationsFromResponse = (response) => response?.data?.data?.locations || [];
const getCitiesFromResponse = (response) => response?.data?.data?.cities || [];
const getPincodesFromResponse = (response) => response?.data?.data?.pincodes || [];
const getAreasFromResponse = (response) => response?.data?.data?.areas || [];
const getId = (value) => value?._id || value || '';
const getCityName = (item) => item?.cityId?.name || 'N/A';
const getPincodeValue = (item) => item?.pincodeId?.pincode || 'N/A';
const getAreaValue = (item) => item?.areaId?.name || 'N/A';

const LocationPage = () => {
  const [locations, setLocations] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCities();
    fetchPincodes();
    fetchAreas();
    fetchLocations();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await citiesAPI.getAll();
      setCities(getCitiesFromResponse(response));
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  const fetchPincodes = async () => {
    try {
      const response = await pincodesAPI.getAll();
      setPincodes(getPincodesFromResponse(response));
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      setAreas(getAreasFromResponse(response));
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationsAPI.getAll();
      setLocations(getLocationsFromResponse(response));
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPincodes = useMemo(
    () => pincodes.filter((item) => getId(item.cityId) === formData.cityId),
    [formData.cityId, pincodes]
  );

  const filteredAreas = useMemo(
    () =>
      areas.filter(
        (item) => getId(item.cityId) === formData.cityId && getId(item.pincodeId) === formData.pincodeId
      ),
    [areas, formData.cityId, formData.pincodeId]
  );

  const cityOptions = useMemo(
    () =>
      cities.map((city) => ({
        value: city._id,
        label: `${city.name} (${city.state})`,
      })),
    [cities]
  );

  const pincodeOptions = useMemo(
    () =>
      filteredPincodes.map((item) => ({
        value: item._id,
        label: item.pincode,
      })),
    [filteredPincodes]
  );

  const areaOptions = useMemo(
    () =>
      filteredAreas.map((item) => ({
        value: item._id,
        label: item.name,
      })),
    [filteredAreas]
  );

  const resetForm = () => {
    setEditingLocation(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (item) => {
    setEditingLocation(item);
    setFormData({
      cityId: getId(item.cityId),
      pincodeId: getId(item.pincodeId),
      areaId: getId(item.areaId),
      name: item.name || '',
      lat: item.lat ?? '',
      lng: item.lng ?? '',
      status: item.status ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.cityId || !formData.pincodeId || !formData.areaId || !formData.name.trim()) {
      showWarning('City, pincode, area, and location name are required');
      return;
    }

    if (formData.lat === '' || formData.lng === '') {
      showWarning('Latitude and longitude are required');
      return;
    }

    const payload = {
      cityId: formData.cityId,
      pincodeId: formData.pincodeId,
      areaId: formData.areaId,
      name: formData.name.trim(),
      lat: Number(formData.lat),
      lng: Number(formData.lng),
      status: formData.status,
    };

    try {
      setSubmitting(true);

      if (editingLocation) {
        await locationsAPI.update(editingLocation._id, payload);
      } else {
        await locationsAPI.create(payload);
      }

      await fetchLocations();
      setModalOpen(false);
      resetForm();
      showSuccess(editingLocation ? 'Location updated successfully' : 'Location created successfully');
    } catch (error) {
      console.error('Error saving location:', error);
      showError(error?.response?.data?.message || 'Failed to save location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Location?',
      text: 'This location will be removed from the system.',
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

    if (!result.isConfirmed) {
      return;
    }

    try {
      await locationsAPI.delete(id);
      await fetchLocations();
      showSuccess('Location deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      showError(error?.response?.data?.message || 'Failed to delete location');
    }
  };

  const handleStatusToggle = async (item) => {
    try {
      await locationsAPI.update(item._id, {
        cityId: getId(item.cityId),
        pincodeId: getId(item.pincodeId),
        areaId: getId(item.areaId),
        name: item.name,
        lat: item.lat,
        lng: item.lng,
        status: !item.status,
      });
      await fetchLocations();
    } catch (error) {
      console.error('Error updating location status:', error);
      showError(error?.response?.data?.message || 'Failed to update location status');
    }
  };

  const columns = [
    { header: 'CITY', key: 'cityId', render: (row) => <span className="capitalize">{getCityName(row)}</span> },
    { header: 'PINCODE', key: 'pincodeId', render: (row) => getPincodeValue(row) },
    { header: 'AREA', key: 'areaId', render: (row) => getAreaValue(row) },
    { header: 'LOCATION', key: 'name' },
    { header: 'LAT', key: 'lat', render: (row) => row.lat ?? 'N/A' },
    { header: 'LNG', key: 'lng', render: (row) => row.lng ?? 'N/A' },
    {
      header: 'STATUS',
      key: 'status',
      render: (row) => (
        <button
          type="button"
          role="switch"
          aria-checked={row.status}
          onClick={() => handleStatusToggle(row)}
          className={`inline-flex items-center gap-3 rounded-full px-3 py-1.5 text-xs font-semibold ${
            row.status
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full ${
              row.status ? 'bg-green-600' : 'bg-gray-400 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                row.status ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </span>
          {row.status ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      header: 'ACTIONS',
      key: 'actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEdit(row)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md" title="Edit">
            <FaEdit />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Delete">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Location Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage location points inside an area, including coordinates.</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setImportModalOpen(true)}>
            <FaFileImport className="mr-2" />
            Import CSV
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            <FaPlus className="mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={locations} loading={loading} emptyMessage="No locations found" />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false);
            resetForm();
          }
        }}
        title={editingLocation ? 'Edit Location' : 'Add Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
            <SearchableSelect
              value={formData.cityId}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  cityId: value,
                  pincodeId: '',
                  areaId: '',
                }))
              }
              options={cityOptions}
              placeholder="Select a city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
            <SearchableSelect
              value={formData.pincodeId}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  pincodeId: value,
                  areaId: '',
                }))
              }
              options={pincodeOptions}
              placeholder={formData.cityId ? 'Select a pincode' : 'Select a city first'}
              disabled={!formData.cityId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area</label>
            <SearchableSelect
              value={formData.areaId}
              onChange={(value) => handleInputChange('areaId', value)}
              options={areaOptions}
              placeholder={formData.pincodeId ? 'Select an area' : 'Select a pincode first'}
              disabled={!formData.pincodeId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => handleInputChange('lat', e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) => handleInputChange('lng', e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formData.status ? 'Active' : 'Inactive'}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.status}
              onClick={() => handleInputChange('status', !formData.status)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.status ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.status ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingLocation ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <DataImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={fetchLocations}
        type="location"
      />
    </div>
  );
};

export default LocationPage;
