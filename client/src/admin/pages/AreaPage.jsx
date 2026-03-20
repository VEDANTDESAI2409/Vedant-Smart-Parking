import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt, FaCity, FaMailBulk, FaFileImport } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import DataImportModal from '../components/DataImportModal';
import { areasAPI, citiesAPI, pincodesAPI } from '../../services/api';

const initialFormData = {
  city: '',
  pincode: '',
  name: '',
  status: true,
};

const getAreasFromResponse = (response) =>
  response?.data?.data?.areas || response?.data?.areas || response?.data?.data || response?.data || [];

const getCitiesFromResponse = (response) =>
  response?.data?.data?.cities || response?.data?.cities || response?.data?.data || response?.data || [];

const getPincodesFromResponse = (response) =>
  response?.data?.data?.pincodes || response?.data?.pincodes || response?.data?.data || response?.data || [];

const getDisplayValue = (value) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    return value.name || value.title || value.code || value._id || '';
  }
  return '';
};

const getCityName = (item) => getDisplayValue(item?.city || item?.cityId);
const getPincodeValue = (item) => getDisplayValue(item?.pincode || item?.pincodeId);

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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAreas();
    fetchCities();
    fetchPincodes();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await areasAPI.getAll();
      const list = getAreasFromResponse(response);
      setAreas(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
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
      setCities([]);
    }
  };

  const fetchPincodes = async () => {
    try {
      const response = await pincodesAPI.getAll();
      const list = getPincodesFromResponse(response);
      setPincodes(Array.isArray(list) ? list : []);
    } catch (error) {
      setPincodes([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredAreas = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return areas;
    return areas.filter(a => 
      a.name?.toLowerCase().includes(lowerSearch) || 
      getCityName(a)?.toLowerCase().includes(lowerSearch) ||
      getPincodeValue(a)?.toString().includes(lowerSearch)
    );
  }, [areas, searchTerm]);

  const filteredPincodes = useMemo(
    () => pincodes.filter((item) => getCityName(item) === formData.city),
    [formData.city, pincodes]
  );

  const handleStatusToggle = async (area) => {
    try {
      const newStatus = !area.status;
      await areasAPI.update(area._id, {
        city: getCityName(area),
        pincode: getPincodeValue(area),
        name: area.name,
        status: newStatus,
      });
      setAreas(prev => prev.map(a => a._id === area._id ? { ...a, status: newStatus } : a));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, name: formData.name.trim() };

    try {
      setSubmitting(true);
      if (editingArea) {
        await areasAPI.update(editingArea._id, payload);
      } else {
        await areasAPI.create(payload);
      }
      await fetchAreas();
      setModalOpen(false);
      setEditingArea(null);
      setFormData(initialFormData);
    } catch (error) {
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
    } catch (error) {
      alert('Failed to delete area');
    }
  };

  const columns = [
    { 
      header: 'AREA NAME', 
      render: (row) => (
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                <FaMapMarkerAlt size={14} />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">{row.name}</span> 
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
      header: 'PINCODE', 
      render: (row) => (
        <div className="flex items-center gap-2">
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <FaMailBulk size={10}/> {getPincodeValue(row) || 'N/A'}
            </span>
        </div>
      )
    },
    { 
      header: 'STATUS', 
      render: (row) => (
        <button
          type="button"
          onClick={() => handleStatusToggle(row)}
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
                setEditingArea(row);
                setFormData({ city: getCityName(row), pincode: getPincodeValue(row), name: row.name, status: row.status });
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
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Area Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Map locations to specific cities and pincodes</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              value={searchTerm}
              placeholder="Search area, city, or pincode..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all font-medium"
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
            onClick={() => { setEditingArea(null); setFormData(initialFormData); setModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-bold text-sm"
          >
            <FaPlus size={14} />
            <span>Add Area</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        <Table columns={columns} data={filteredAreas} loading={loading} />
        {!loading && filteredAreas.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 dark:text-slate-500 font-medium">No areas found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Modal Section */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingArea ? 'Update Area' : 'Create New Area'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">City</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value, pincode: '' }))}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl outline-none text-sm dark:text-white font-bold cursor-pointer appearance-none"
                required
              >
                <option value="">Select City</option>
                {cities.map((city) => <option key={city._id} value={city.name}>{city.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Pincode</label>
              <select
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                disabled={!formData.city}
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl outline-none text-sm dark:text-white disabled:opacity-50 font-bold cursor-pointer"
                required
              >
                <option value="">Pincode</option>
                {filteredPincodes.map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Area Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl outline-none text-sm dark:text-white font-bold"
              placeholder="e.g. Adajan"
              required
            />
          </div>

          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Availability</span>
              <span className="block text-xs text-slate-500">Enable/Disable area for bookings</span>
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
              className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {submitting ? 'Processing...' : editingArea ? 'Update Area' : 'Create Area'}
          </button>
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
