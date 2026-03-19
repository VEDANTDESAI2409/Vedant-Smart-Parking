import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { pincodesAPI } from '../../services/api';

const PincodePage = () => {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPincode, setEditingPincode] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: true });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      setLoading(true);
      const response = await pincodesAPI.getAll();
      const list = response?.data?.data?.pincodes || [];
      setPincodes(list);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingPincode(null);
    setFormData({ name: '', status: true });
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (pincode) => {
    setEditingPincode(pincode);
    setFormData({
      name: pincode.name || '',
      status: pincode.status ?? true,
    });
    setModalOpen(true);
  };

  const validateForm = () => {
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
              {submitting ? 'Saving...' : editingPincode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PincodePage;
