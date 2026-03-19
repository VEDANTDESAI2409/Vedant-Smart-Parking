import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { citiesAPI, pincodesAPI } from '../../services/api';

const initialFormData = { city: '', name: '', status: true };

const getPincodesFromResponse = (response) =>
  response?.data?.data?.pincodes ||
  response?.data?.pincodes ||
  response?.data?.data ||
  response?.data ||
  [];

const getCitiesFromResponse = (response) =>
  response?.data?.data?.cities ||
  response?.data?.cities ||
  response?.data?.data ||
  response?.data ||
  [];

const getCityName = (item) => item?.city || item?.cityId || '';

const PincodePage = () => {
  const [pincodes, setPincodes] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPincode, setEditingPincode] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    fetchPincodes();
    fetchCities();
  }, []);

  const fetchPincodes = async () => {
    try {
      setLoading(true);
      const response = await pincodesAPI.getAll();
      const list = getPincodesFromResponse(response);
      setPincodes(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
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

  const resetForm = () => {
    setEditingPincode(null);
    setFormData(initialFormData);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (pincode) => {
    setEditingPincode(pincode);
    setFormData({
      city: getCityName(pincode),
      name: pincode.name || '',
      status: pincode.status ?? true,
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.city) return 'City is required';
    if (!formData.name.trim()) return 'Pincode is required';
    if (!/^\d{6}$/.test(formData.name.trim())) return 'Pincode must be 6 digits';
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
      name: formData.name.trim(),
      status: formData.status,
    };

    try {
      setSubmitting(true);

      if (editingPincode) {
        await pincodesAPI.update(editingPincode._id, payload);
      } else {
        await pincodesAPI.create(payload);
      }

      await fetchPincodes();
      setModalOpen(false);
      resetForm();
      alert(editingPincode ? 'Pincode updated successfully' : 'Pincode created successfully');
    } catch (error) {
      console.error('Error saving pincode:', error);
      alert(error?.response?.data?.message || 'Failed to save pincode');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pincode?')) return;

    try {
      await pincodesAPI.delete(id);
      await fetchPincodes();
      alert('Pincode deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error?.response?.data?.message || 'Failed to delete pincode');
    }
  };

  const columns = [
    { header: 'City', key: 'city', render: (row) => <span className="capitalize">{getCityName(row) || 'N/A'}</span> },
    { header: 'Pincode', key: 'name' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold capitalize ${
            row.status
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {row.status ? 'Active' : 'Inactive'}
        </span>
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
          <h1 className="text-2xl font-bold">Pincode Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, update, and delete pincodes.</p>
        </div>

        <Button onClick={openCreateModal}>
          <FaPlus className="mr-2" />
          Add Pincode
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={pincodes} loading={loading} emptyMessage="No pincodes found" />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false);
            resetForm();
          }
        }}
        title={editingPincode ? 'Edit Pincode' : 'Add Pincode'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              {submitting ? 'Saving...' : editingPincode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PincodePage;
