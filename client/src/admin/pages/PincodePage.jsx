import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt, FaCity } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
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

const getCityName = (item) => item?.cityId?.name || item?.city?.name || item?.city || item?.name || '';

const PincodePage = () => {
  const [pincodes, setPincodes] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPincode, setEditingPincode] = useState(null);
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

  const filteredPincodes = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return pincodes;
    return pincodes.filter(p => 
      p.name?.toLowerCase().includes(lowerSearch) || 
      String(getCityName(p) || '').toLowerCase().includes(lowerSearch)
    );
  }, [pincodes, searchTerm]);

  const togglePincodeStatus = async (pincode) => {
    try {
      const newStatus = !pincode.status;
      await pincodesAPI.update(pincode._id, { ...pincode, status: newStatus });
      setPincodes(prev => prev.map(p => p._id === pincode._id ? { ...p, status: newStatus } : p));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.city) return alert('City is required');
    if (!/^\d{6}$/.test(formData.name.trim())) return alert('Pincode must be 6 digits');

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
      setEditingPincode(null);
      setFormData(initialFormData);
    } catch (error) {
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
    } catch (error) {
      alert('Failed to delete pincode');
    }
  };

  const columns = [
    { 
      header: 'PINCODE', 
      render: (row) => (
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                <FaMapMarkerAlt size={14} />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm tracking-widest font-mono">{row.name}</span> 
        </div>
      )
    },
    { 
      header: 'CITY', 
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium capitalize text-sm">
            <FaCity size={12} className="opacity-70 text-blue-500" />
            {getCityName(row) || 'N/A'}
        </div>
      )
    },
    { 
      header: 'STATUS', 
      render: (row) => (
        <button
          type="button"
          onClick={() => togglePincodeStatus(row)}
          className={`inline-flex items-center gap-3 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            row.status
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full ${row.status ? 'bg-green-600' : 'bg-gray-400 dark:bg-gray-600'}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${row.status ? 'translate-x-5' : 'translate-x-0.5'}`} />
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
                setEditingPincode(row);
                setFormData({ city: getCityName(row), name: row.name, status: row.status });
                setModalOpen(true);
            }} className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg group">
                <FaEdit size={14} className="group-active:scale-90 transition-transform" />
            </button>
            <button onClick={() => handleDelete(row._id)} className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 dark:bg-red-900/10 rounded-lg group">
                <FaTrash size={14} className="group-active:scale-90 transition-transform" />
            </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-6 lg:p-10 font-sans transition-colors duration-300">
      
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Pincode Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage postal codes and service regions</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              value={searchTerm}
              placeholder="Search pincode or city..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingPincode(null); setFormData(initialFormData); setModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-bold text-sm"
          >
            <FaPlus size={14} />
            <span>Add Pincode</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        <Table columns={columns} data={filteredPincodes} loading={loading} />
        
        {!loading && filteredPincodes.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 dark:text-slate-500 font-medium">No results found for your search.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingPincode ? 'Update Pincode' : 'Create New Pincode'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
              Select City
            </label>
            <select
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl outline-none text-sm dark:text-white transition-all font-bold cursor-pointer"
              required
            >
              <option value="">Choose a city</option>
              {cities.map((city) => (
                <option key={city._id || city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
              Pincode (6-Digits)
            </label>
            <input
              type="text"
              maxLength="6"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all font-bold"
              placeholder="e.g. 395001"
              required
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Active Status</span>
              <span className="block text-xs text-slate-500">Should this be visible to users?</span>
            </div>
            <button 
                type="button"
                onClick={() => handleInputChange('status', !formData.status)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    formData.status ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
            >
                <span className={`${formData.status ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md`} />
            </button>
          </div>

          <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : editingPincode ? 'Save Changes' : 'Add Pincode'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default PincodePage;
