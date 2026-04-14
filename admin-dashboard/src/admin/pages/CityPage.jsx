import React, { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaFileImport, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import ListSearchInput from '../../components/ListSearchInput';
import DataImportModal from '../components/DataImportModal';
import { citiesAPI } from '../../services/api';
import { shouldConfirmBulkDelete } from '../../utils/adminPreferences';
import { showError, showSuccess, showWarning } from '../../utils/toastService';

const initialFormData = { name: '', state: '', status: true };

const CityPage = () => {
  const [cities, setCities] = useState([]);
  const [selectedCityIds, setSelectedCityIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    setSelectedCityIds((prev) => prev.filter((id) => cities.some((city) => city._id === id)));
  }, [cities]);

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
      showWarning('City name and state are required');
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
      showSuccess(editingCity ? 'City updated successfully' : 'City created successfully');
    } catch (error) {
      console.error('Error saving city:', error);
      showError(error?.response?.data?.message || 'Failed to save city');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (city) => {
    const result = await Swal.fire({
      title: 'Delete City?',
      text: city ? `Delete ${city.name}, ${city.state}? This action cannot be undone.` : 'This action cannot be undone.',
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
      await citiesAPI.delete(city._id);
      await fetchCities();
      showSuccess('City deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      showError(error?.response?.data?.message || 'Failed to delete city');
    }
  };

  const handleCitySelect = (id, checked) => {
    setSelectedCityIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((selectedId) => selectedId !== id)
    );
  };

  const handleSelectAllCities = (checked) => {
    setSelectedCityIds(checked ? filteredCities.map((city) => city._id).filter(Boolean) : []);
  };

  const handleBulkDelete = async () => {
    if (!selectedCityIds.length) {
      showWarning('Please select at least one city');
      return;
    }

    if (shouldConfirmBulkDelete()) {
      const result = await Swal.fire({
        title: 'Delete Selected Cities?',
        text: `Delete ${selectedCityIds.length} selected cities? This action cannot be undone.`,
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
      const results = await Promise.allSettled(selectedCityIds.map((id) => citiesAPI.delete(id)));
      const successCount = results.filter((item) => item.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      await fetchCities();
      setSelectedCityIds([]);

      if (successCount) {
        showSuccess(
          failureCount
            ? `${successCount} cities deleted, ${failureCount} failed`
            : `${successCount} cities deleted successfully`
        );
      } else {
        showError('Failed to delete selected cities');
      }
    } catch (error) {
      console.error('Bulk city delete error:', error);
      showError('Failed to delete selected cities');
    }
  };

  const handleStatusToggle = async (city) => {
    try {
      await citiesAPI.update(city._id, {
        name: city.name,
        state: city.state,
        status: !city.status,
      });
      await fetchCities();
    } catch (error) {
      console.error('Error updating city status:', error);
      showError(error?.response?.data?.message || 'Failed to update city status');
    }
  };

  const columns = [
    { header: 'NAME', key: 'name', render: (row) => <span className="capitalize">{row.name}</span> },
    { header: 'STATE', key: 'state', render: (row) => <span className="capitalize">{row.state}</span> },
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
          <button onClick={() => handleDelete(row)} className="p-2 text-red-600 hover:bg-red-100 rounded-md" title="Delete">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const filteredCities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return cities;
    }

    return cities.filter((city) =>
      [city.name, city.state, city.status ? 'active' : 'inactive']
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [cities, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">City Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create cities one by one or import them from CSV.</p>
        </div>

        <div className="flex gap-3">
          {selectedCityIds.length > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              <FaTrash className="mr-2" />
              Delete Selected ({selectedCityIds.length})
            </Button>
          )}
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
        <div className="mb-4">
          <ListSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search city, state, or status..."
          />
        </div>
        <Table
          columns={columns}
          data={filteredCities}
          loading={loading}
          emptyMessage={searchTerm.trim() ? `No cities found matching "${searchTerm}"` : 'No cities found'}
          selectable
          selectedRowIds={selectedCityIds}
          onRowSelect={handleCitySelect}
          onSelectAll={handleSelectAllCities}
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
