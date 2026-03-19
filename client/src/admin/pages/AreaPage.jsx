import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { areasAPI } from '../../services/api';

const AreaPage = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: true });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await areasAPI.getAll();
      const list = response?.data?.data?.areas || [];
      setAreas(list);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingArea(null);
    setFormData({ name: '', status: true });
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      name: area.name || '',
      status: area.status ?? true,
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Area name is required';
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

  const columns = [
    { header: 'Name', key: 'name' },
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
              {submitting ? 'Saving...' : editingArea ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AreaPage;
