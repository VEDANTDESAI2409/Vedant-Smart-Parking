import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { citiesAPI, pincodesAPI, areasAPI, locationsAPI } from '../../services/api';

const ManageServiceLocation = ({ type }) => {
  const [selectedType, setSelectedType] = useState(type || 'city');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: true });
  const [submitting, setSubmitting] = useState(false);

  const types = [
    { value: 'city', label: 'City', api: citiesAPI, key: 'cities' },
    { value: 'pincode', label: 'Pincode', api: pincodesAPI, key: 'pincodes' },
    { value: 'area', label: 'Area', api: areasAPI, key: 'areas' },
    { value: 'location', label: 'Location', api: locationsAPI, key: 'locations' },
  ];

  useEffect(() => {
    setSelectedType(type);
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const currentType = types.find(t => t.value === selectedType);
      const response = await currentType.api.getAll();
      setData(response.data.data[currentType.key] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({ name: '', status: true });
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      status: item.status ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert(`${types.find(t => t.value === selectedType).label} name is required`);
      return;
    }

    try {
      setSubmitting(true);
      const currentType = types.find(t => t.value === selectedType);
      const api = currentType.api;

      if (editingItem) {
        await api.update(editingItem._id, formData);
      } else {
        await api.create(formData);
      }

      await fetchData();
      setModalOpen(false);
      resetForm();
      alert(editingItem ? `${currentType.label} updated successfully` : `${currentType.label} created successfully`);
    } catch (error) {
      console.error('Error saving item:', error);
      alert(error?.response?.data?.message || `Failed to save ${selectedType}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${selectedType}?`)) return;

    try {
      const currentType = types.find(t => t.value === selectedType);
      const api = currentType.api;
      await api.delete(id);
      await fetchData();
      alert(`${currentType.label} deleted successfully`);
    } catch (error) {
      console.error('Delete error:', error);
      alert(error?.response?.data?.message || `Failed to delete ${selectedType}`);
    }
  };

  const handleStatusToggle = async (item) => {
    try {
      const currentType = types.find(t => t.value === selectedType);
      const api = currentType.api;
      await api.update(item._id, { status: !item.status });
      await fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => (
    <span
      className={`px-3 py-1 text-xs rounded-full font-semibold capitalize ${
        status
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      }`}
    >
      {status ? 'Active' : 'Inactive'}
    </span>
  );

  const columns = [
    { header: 'ID', key: '_id', render: (row) => row._id.substring(0, 8) + '...' },
    { header: 'Name', key: 'name' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <div className="flex items-center space-x-2">
          {getStatusBadge(row.status)}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={row.status}
              onChange={() => handleStatusToggle(row)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
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

  const getPluralLabel = (value) => {
    switch (value) {
      case 'city':
        return 'cities';
      case 'pincode':
        return 'pincodes';
      case 'area':
        return 'areas';
      case 'location':
        return 'locations';
      default:
        return `${value}s`;
    }
  };

  const currentType = types.find((t) => t.value === selectedType);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manage {currentType.label}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage {getPluralLabel(selectedType)}</p>
        </div>

        <Button onClick={openCreateModal}>
          <FaPlus className="mr-2" />
          Add {currentType.label}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage={`No ${getPluralLabel(selectedType)} found`}
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
        title={editingItem ? `Edit ${currentType.label}` : `Add ${currentType.label}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status}
              onChange={(e) => handleInputChange('status', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageServiceLocation;