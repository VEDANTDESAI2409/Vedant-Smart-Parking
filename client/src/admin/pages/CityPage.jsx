import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt, FaFileImport } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
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
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await citiesAPI.getAll();
      const list =
        response?.data?.data?.cities ||
        response?.data?.cities ||
        response?.data?.data ||
        response?.data ||
        [];
      setCities(list);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return cities;
    return cities.filter((city) =>
      city.name?.toLowerCase().includes(lowerSearch) ||
      city.state?.toLowerCase().includes(lowerSearch)
    );
  }, [cities, searchTerm]);

  // Updated toggle to match AreaPage logic
  const toggleCityStatus = async (city) => {
    try {
      const newStatus = !city.status;
      await citiesAPI.update(city._id, { ...city, status: newStatus });
      // Optimistic UI update
      setCities(prev => prev.map(c => c._id === city._id ? { ...c, status: newStatus } : c));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.state.trim()) return alert('City name and state are required');

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
      setEditingCity(null);
      setFormData(initialFormData);
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to save city');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;
    try {
      await citiesAPI.delete(id);
      await fetchCities();
    } catch (error) {
      alert('Failed to delete city');
    }
  };

  const columns = [
    { 
      header: 'CITY NAME', 
      render: (row) => (
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                <FaMapMarkerAlt size={14} />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100 capitalize text-sm">{row.name}</span> 
        </div>
      )
    },
    {
      header: 'STATE',
      render: (row) => (
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 capitalize">
          {row.state || 'N/A'}
        </span>
      )
    },
    { 
      header: 'STATUS', 
      render: (row) => (
        /* Status Toggle updated to match AreaPage style */
        <button
          type="button"
          role="switch"
          aria-checked={row.status}
          onClick={() => toggleCityStatus(row)}
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
      ) 
    },
    { 
      header: 'ACTION', 
      render: (row) => (
        <div className="flex items-center gap-2">
            <button onClick={() => {
                setEditingCity(row);
                setFormData({ name: row.name, state: row.state || '', status: row.status });
                setModalOpen(true);
            }} className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg group">
                <FaEdit size={14} className="group-active:scale-90 transition-transform"/>
            </button>
            <button onClick={() => handleDelete(row._id)} className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 dark:bg-red-900/10 rounded-lg group">
                <FaTrash size={14} className="group-active:scale-90 transition-transform"/>
            </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-6 lg:p-10 font-sans transition-colors duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">City Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage operational zones and visibility</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              value={searchTerm}
              placeholder="Search city name..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-[#1E293B] text-slate-700 dark:text-slate-200 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 transition-all active:scale-95 font-bold text-sm"
          >
            <FaFileImport size={14} />
            <span>Import CSV</span>
          </button>
          <button 
            onClick={() => { setEditingCity(null); setFormData(initialFormData); setModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-bold text-sm"
          >
            <FaPlus size={14} />
            <span>Add City</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        <Table columns={columns} data={filteredCities} loading={loading} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingCity ? 'Update City' : 'Create New City'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
              City Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all font-bold"
              placeholder="Enter city name..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all font-bold"
              placeholder="Enter state name..."
              required
            />
          </div>

          {/* Status section in Modal updated to match AreaPage UI */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Active Status</p>
              <p className="text-xs text-slate-500">
                {formData.status ? 'City is currently Active' : 'City is currently Inactive'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.status}
              onClick={() => handleInputChange('status', !formData.status)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.status ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.status ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : editingCity ? 'Save Changes' : 'Add City'}
            </button>
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
