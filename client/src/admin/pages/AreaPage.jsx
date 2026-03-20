import React, { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaFileImport, FaPlus, FaTrash } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import DataImportModal from '../components/DataImportModal';
import { areasAPI, citiesAPI, pincodesAPI } from '../../services/api';

const initialFormData = { cityId: '', pincodeId: '', name: '', status: true };

const getAreasFromResponse = (response) => response?.data?.data?.areas || [];
const getCitiesFromResponse = (response) => response?.data?.data?.cities || [];
const getPincodesFromResponse = (response) => response?.data?.data?.pincodes || [];
const getId = (value) => value?._id || value || '';
const getCityName = (item) => item?.cityId?.name || 'N/A';
const getPincodeValue = (item) => item?.pincodeId?.pincode || 'N/A';

const AreaPage = () => {
  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCities();
    fetchPincodes();
    fetchAreas();
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
      setLoading(true);
      const response = await areasAPI.getAll();
      setAreas(getAreasFromResponse(response));
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPincodes = useMemo(
    () => pincodes.filter((item) => getId(item.cityId) === formData.cityId),
    [formData.cityId, pincodes]
  );

  const resetForm = () => {
    setEditingArea(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (item) => {
    setEditingArea(item);
    setFormData({
      cityId: getId(item.cityId),
      pincodeId: getId(item.pincodeId),
      name: item.name || '',
      status: item.status ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.cityId || !formData.pincodeId || !formData.name.trim()) {
      alert('City, pincode, and area name are required');
      return;
    }

    const payload = {
      cityId: formData.cityId,
      pincodeId: formData.pincodeId,
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
    if (!window.confirm('Delete this area?')) {
      return;
    }

    try {
      await areasAPI.delete(id);
      await fetchAreas();
      alert('Area deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error?.response?.data?.message || 'Failed to delete area');
    }
  };

  const handleStatusToggle = async (item) => {
    try {
      await areasAPI.update(item._id, {
        cityId: getId(item.cityId),
        pincodeId: getId(item.pincodeId),
        name: item.name,
        status: !item.status,
      });
      await fetchAreas();
    } catch (error) {
      console.error('Error updating area status:', error);
      alert(error?.response?.data?.message || 'Failed to update area status');
    }
  };

  const columns = [
    { header: 'CITY', key: 'cityId', render: (row) => <span className="capitalize">{getCityName(row)}</span> },
    { header: 'PINCODE', key: 'pincodeId', render: (row) => getPincodeValue(row) },
    { header: 'AREA NAME', key: 'name' },
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
          <h1 className="text-2xl font-bold">Area Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage areas inside each city and pincode.</p>
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
            Add Area
          </Button>
        </div>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
            <select
              value={formData.cityId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cityId: e.target.value,
                  pincodeId: '',
                }))
              }
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
            <select
              value={formData.pincodeId}
              onChange={(e) => handleInputChange('pincodeId', e.target.value)}
              disabled={!formData.cityId}
              className="mt-1 w-full rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:disabled:bg-gray-800"
              required
            >
              <option value="">{formData.cityId ? 'Select a pincode' : 'Select a city first'}</option>
              {filteredPincodes.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.pincode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              {submitting ? 'Saving...' : editingArea ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <DataImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={fetchAreas}
        type="area"
      />
    </div>
  );
};

export default AreaPage;
