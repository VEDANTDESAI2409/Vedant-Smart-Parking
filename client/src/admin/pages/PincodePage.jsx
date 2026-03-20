import React, { useEffect, useState } from 'react';
import { FaEdit, FaFileImport, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import DataImportModal from '../components/DataImportModal';
import { citiesAPI, pincodesAPI } from '../../services/api';
import { showError, showSuccess, showWarning } from '../../utils/toastService';

const initialFormData = { cityId: '', pincode: '', status: true };

const getCitiesFromResponse = (response) => response?.data?.data?.cities || [];
const getPincodesFromResponse = (response) => response?.data?.data?.pincodes || [];
const getCityId = (item) => item?.cityId?._id || item?.cityId || '';
const getCityName = (item) => item?.cityId?.name || 'N/A';

const PincodePage = () => {
  const [pincodes, setPincodes] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingPincode, setEditingPincode] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCities();
    fetchPincodes();
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
      setLoading(true);
      const response = await pincodesAPI.getAll();
      setPincodes(getPincodesFromResponse(response));
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingPincode(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (item) => {
    setEditingPincode(item);
    setFormData({
      cityId: getCityId(item),
      pincode: item.pincode || '',
      status: item.status ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.cityId) {
      showWarning('City is required');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      showWarning('Pincode must be exactly 6 digits');
      return;
    }

    const payload = {
      cityId: formData.cityId,
      pincode: formData.pincode.trim(),
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
      showSuccess(editingPincode ? 'Pincode updated successfully' : 'Pincode created successfully');
    } catch (error) {
      console.error('Error saving pincode:', error);
      showError(error?.response?.data?.message || 'Failed to save pincode');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Pincode?',
      text: 'This pincode will be removed from the system.',
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
      await pincodesAPI.delete(id);
      await fetchPincodes();
      showSuccess('Pincode deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      showError(error?.response?.data?.message || 'Failed to delete pincode');
    }
  };

  const columns = [
    { header: 'CITY', key: 'cityId', render: (row) => <span className="capitalize">{getCityName(row)}</span> },
    { header: 'PINCODE', key: 'pincode' },
    {
      header: 'STATUS',
      key: 'status',
      render: (row) => (
        <span
          className={`px-3 py-1 text-xs rounded-full font-semibold ${
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
          <h1 className="text-2xl font-bold">Pincode Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create pincodes manually or bulk import them for a city.</p>
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
            Add Pincode
          </Button>
        </div>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
            <select
              value={formData.cityId}
              onChange={(e) => handleInputChange('cityId', e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {city.name} ({city.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g. 395007"
              required
            />
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
              {submitting ? 'Saving...' : editingPincode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <DataImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={fetchPincodes}
        type="pincode"
      />
    </div>
  );
};

export default PincodePage;
