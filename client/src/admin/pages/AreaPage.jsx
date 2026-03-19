import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { areasAPI, citiesAPI, pincodesAPI } from '../../services/api';

const initialFormData = {
  city: '',
  pincode: '',
  name: '',
  status: true,
};

const getAreasFromResponse = (response) =>
  response?.data?.data?.areas ||
  response?.data?.areas ||
  response?.data?.data ||
  response?.data ||
  [];

const getCitiesFromResponse = (response) =>
  response?.data?.data?.cities ||
  response?.data?.cities ||
  response?.data?.data ||
  response?.data ||
  [];

const getPincodesFromResponse = (response) =>
  response?.data?.data?.pincodes ||
  response?.data?.pincodes ||
  response?.data?.data ||
  response?.data ||
  [];

const getCityName = (item) => item?.city || item?.cityId || '';
const getPincodeValue = (item) => item?.pincode || item?.pincodeId || '';

const AreaPage = () => {
  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    fetchAreas();
    fetchCities();
    fetchPincodes();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await areasAPI.getAll();
      const list = getAreasFromResponse(response);
      setAreas(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await citiesAPI.getAll();
      const list = getCitiesFromResponse(response);
      setCities(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  const fetchPincodes = async () => {
    try {
      const response = await pincodesAPI.getAll();
      const list = getPincodesFromResponse(response);
      setPincodes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
    }
  };

  const resetForm = () => {
    setEditingArea(null);
    setFormData(initialFormData);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      city: getCityName(area),
      pincode: getPincodeValue(area),
      name: area.name || '',
      status: area.status ?? true,
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.city) return 'City is required';
    if (!formData.pincode) return 'Pincode is required';
    if (!formData.name.trim()) return 'Area name is required';
    return null;
  };

  const filteredPincodes = useMemo(
    () => pincodes.filter((item) => getCityName(item) === formData.city),
    [formData.city, pincodes]
  );

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
      name: formData.name.trim(),
      status: formData.status,
    };

    try {
      setSubmitting(true);

      if (editingArea) {
        await areasAPI.update(editingArea._id, payload);
      } else {
        await areasAPI.create(payload);
      }

      await fetchAreas();
      setModalOpen(false);
      resetForm();
      alert(editingArea ? 'Area updated successfully' : 'Area created successfully');
    } catch (error) {
      console.error('Error saving area:', error);
      alert(error?.response?.data?.message || 'Failed to save area');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this area?')) return;

    try {
      await areasAPI.delete(id);
      await fetchAreas();
      alert('Area deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error?.response?.data?.message || 'Failed to delete area');
    }
  };

  const handleStatusToggle = async (area) => {
    try {
      await areasAPI.update(area._id, {
        city: getCityName(area),
        pincode: getPincodeValue(area),
        name: area.name,
        status: !area.status,
      });
      await fetchAreas();
    } catch (error) {
      console.error('Error updating area status:', error);
      alert(error?.response?.data?.message || 'Failed to update area status');
    }
  };

  const columns = [
    { header: 'City', key: 'city', render: (row) => <span className="capitalize">{getCityName(row) || 'N/A'}</span> },
    { header: 'Pincode', key: 'pincode', render: (row) => getPincodeValue(row) || 'N/A' },
    { header: 'Area Name', key: 'name' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <button
          type="button"
          role="switch"
          aria-checked={row.status}
          onClick={() => handleStatusToggle(row)}
          className={`inline-flex items-center gap-3 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
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
          <h1 className="text-2xl font-bold">Area Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, update, and delete areas.</p>
        </div>

        <Button onClick={openCreateModal}>
          <FaPlus className="mr-2" />
          Add Area
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={areas} loading={loading} emptyMessage="No areas found" />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false);
            resetForm();
          }
        }}
        title={editingArea ? 'Edit Area' : 'Add Area'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              City
            </label>
            <select
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  city: e.target.value,
                  pincode: '',
                }))
              }
              className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city._id || city.name} value={city.name}>
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
              {filteredPincodes.map((pincode) => (
                <option key={pincode._id || pincode.name} value={pincode.name}>
                  {pincode.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Area Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.status ? 'Active' : 'Inactive'}
              </p>
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
            <span className="sr-only">Status</span>
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
              {submitting ? 'Saving...' : editingArea ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AreaPage;
