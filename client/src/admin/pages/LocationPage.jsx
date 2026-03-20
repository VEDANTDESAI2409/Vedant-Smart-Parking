import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt, FaCity, FaMailBulk, FaLayerGroup } from 'react-icons/fa';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import { areasAPI, citiesAPI, locationsAPI, pincodesAPI } from '../../services/api';

const initialFormData = {
  city: '',
  pincode: '',
  area: '',
  name: '',
  status: true,
};

// Response helper functions
const getLocationsFromResponse = (response) => response?.data?.data?.locations || response?.data?.locations || response?.data?.data || response?.data || [];
const getCitiesFromResponse = (response) => response?.data?.data?.cities || response?.data?.cities || response?.data?.data || response?.data || [];
const getPincodesFromResponse = (response) => response?.data?.data?.pincodes || response?.data?.pincodes || response?.data?.data || response?.data || [];
const getAreasFromResponse = (response) => response?.data?.data?.areas || response?.data?.areas || response?.data?.data || response?.data || [];

const getCityName = (item) => item?.city || item?.cityId || '';
const getPincodeValue = (item) => item?.pincode || item?.pincodeId || '';
const getAreaValue = (item) => item?.area || item?.areaId || '';

const LocationPage = () => {
  const [locations, setLocations] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLocations();
    fetchCities();
    fetchPincodes();
    fetchAreas();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationsAPI.getAll();
      const list = getLocationsFromResponse(response);
      setLocations(Array.isArray(list) ? list : []);
    } catch (error) {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await citiesAPI.getAll();
      setCities(getCitiesFromResponse(response));
    } catch (error) { setCities([]); }
  };

  const fetchPincodes = async () => {
    try {
      const response = await pincodesAPI.getAll();
      setPincodes(getPincodesFromResponse(response));
    } catch (error) { setPincodes([]); }
  };

  const fetchAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      setAreas(getAreasFromResponse(response));
    } catch (error) { setAreas([]); }
  };

  const filteredLocations = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return locations;
    return locations.filter(l => 
      l.name?.toLowerCase().includes(lowerSearch) || 
      getCityName(l)?.toLowerCase().includes(lowerSearch) ||
      getAreaValue(l)?.toLowerCase().includes(lowerSearch)
    );
  }, [locations, searchTerm]);

  const filteredPincodes = useMemo(
    () => pincodes.filter((item) => getCityName(item) === formData.city),
    [formData.city, pincodes]
  );

  const filteredAreas = useMemo(
    () => areas.filter((item) => getPincodeValue(item) === formData.pincode),
    [areas, formData.pincode]
  );

  const handleStatusToggle = async (location) => {
    try {
      const newStatus = !location.status;
      await locationsAPI.update(location._id, {
        city: getCityName(location),
        pincode: getPincodeValue(location),
        area: getAreaValue(location),
        name: location.name,
        status: newStatus,
      });
      setLocations(prev => prev.map(l => l._id === location._id ? { ...l, status: newStatus } : l));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingLocation) {
        await locationsAPI.update(editingLocation._id, formData);
      } else {
        await locationsAPI.create(formData);
      }
      await fetchLocations();
      setModalOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      alert('Failed to save location');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'LOCATION NAME', 
      render: (row) => (
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                <FaMapMarkerAlt size={14} />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">{row.name}</span> 
        </div>
      )
    },
    { 
      header: 'CITY/AREA', 
      render: (row) => (
        <div className="flex flex-col">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold capitalize text-xs">
                <FaCity size={10} className="text-blue-500" /> {getCityName(row)}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-tight">
                <FaLayerGroup size={10} /> {getAreaValue(row)}
            </div>
        </div>
      )
    },
    { 
      header: 'PINCODE', 
      render: (row) => (
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 dark:border-slate-700">
            {getPincodeValue(row)}
        </span>
      )
    },
    { 
      header: 'STATUS', 
      render: (row) => (
        <button
          onClick={() => handleStatusToggle(row)}
          className={`inline-flex items-center gap-3 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            row.status ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
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
                setEditingLocation(row);
                setFormData({ city: getCityName(row), pincode: getPincodeValue(row), area: getAreaValue(row), name: row.name, status: row.status });
                setModalOpen(true);
            }} className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg group">
                <FaEdit size={14} className="group-active:scale-90 transition-transform" />
            </button>
            <button onClick={() => { if(window.confirm('Delete?')) locationsAPI.delete(row._id).then(fetchLocations) }} className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 dark:bg-red-900/10 rounded-lg group">
                <FaTrash size={14} className="group-active:scale-90 transition-transform" />
            </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-6 lg:p-10 font-sans transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Location Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage specific building or spot data</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              value={searchTerm}
              placeholder="Search location, city, area..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingLocation(null); setFormData(initialFormData); setModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-bold text-sm"
          >
            <FaPlus size={14} />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <Table columns={columns} data={filteredLocations} loading={loading} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingLocation ? 'Update Location' : 'Create New Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">City</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value, pincode: '', area: '' }))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl outline-none text-sm dark:text-white font-bold appearance-none"
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
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value, area: '' }))}
                disabled={!formData.city}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl outline-none text-sm dark:text-white disabled:opacity-50 font-bold appearance-none"
                required
              >
                <option value="">Pincode</option>
                {filteredPincodes.map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Area</label>
            <select
              value={formData.area}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              disabled={!formData.pincode}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl outline-none text-sm dark:text-white disabled:opacity-50 font-bold appearance-none"
              required
            >
              <option value="">Select Area</option>
              {filteredAreas.map((a) => <option key={a._id} value={a.name}>{a.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Location / Building Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl outline-none text-sm dark:text-white font-bold"
              placeholder="e.g. Empire Business Hub"
              required
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Active Status</span>
              <span className="block text-xs text-slate-500">Enable this location for users</span>
            </div>
            <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}
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
            {submitting ? 'Processing...' : editingLocation ? 'Update Location' : 'Create Location'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default LocationPage;