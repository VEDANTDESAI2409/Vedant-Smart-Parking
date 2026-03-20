import React, { useEffect, useState } from 'react';
import { FaEdit, FaFileImport, FaPlus, FaTrash } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import DataImportModal from '../components/DataImportModal';
import { citiesAPI } from '../../services/api';

const initialFormData = { name: '', state: '', status: true };

const CityPage = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await citiesAPI.getAll();
      setCities(response?.data?.data?.cities || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingCity(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name || '',
      state: city.state || '',
      status: city.status ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.state.trim()) {
      alert('City name and state are required');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      state: formData.state.trim(),
      status: formData.status,
    };

    try {
      setSubmitting(true);

      if (editingCity) {
        await citiesAPI.update(editingCity._id, payload);
      } else {
        await citiesAPI.create(payload);
      }

      await fetchCities();
      setModalOpen(false);
      resetForm();
      alert(editingCity ? 'City updated successfully' : 'City created successfully');
    } catch (error) {
      console.error('Error saving city:', error);
      alert(error?.response?.data?.message || 'Failed to save city');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this city?')) {
      return;
    }

    try {
      await citiesAPI.delete(id);
      await fetchCities();
      alert('City deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error?.response?.data?.message || 'Failed to delete city');
    }
  };

  const columns = [
    { header: 'NAME', key: 'name', render: (row) => <span className="capitalize">{row.name}</span> },
    { header: 'STATE', key: 'state', render: (row) => <span className="capitalize">{row.state}</span> },
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
          <h1 className="text-2xl font-bold">City Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create cities one by one or import them from CSV.</p>
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
            Add City
          </Button>
        </div>
      </div>

      <Card>
        <Table columns={columns} data={cities} loading={loading} emptyMessage="No cities found" />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false);
            resetForm();
          }
        }}
        title={editingCity ? 'Edit City' : 'Add City'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g. Surat"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g. Gujarat"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="city-status"
              checked={formData.status}
              onChange={(e) => handleInputChange('status', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="city-status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
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
              {submitting ? 'Saving...' : editingCity ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <DataImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={fetchCities}
        type="city"
      />
    </div>
  );
};

export default CityPage;
