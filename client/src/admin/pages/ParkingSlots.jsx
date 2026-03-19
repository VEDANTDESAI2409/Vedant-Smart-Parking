import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCar, FaWheelchair, FaSearch, FaHashtag } from 'react-icons/fa';
import { MdElectricBolt } from 'react-icons/md';

import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';
import {
  slotsAPI,
  citiesAPI,
  pincodesAPI,
  areasAPI,
  locationsAPI,
} from '../../services/api';
import { slotsAPI } from '../../services/api';

const initialFormData = {
  city: '',
  pincode: '',
  area: '',
  location: '',
  landmark: '',
  vehicleType: 'car',
  slotType: 'normal',
  slotLocation: '',
  price: '',
};

const ParkingSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  // 1. Add searchTerm state
  const [searchTerm, setSearchTerm] = useState("");

  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  useEffect(() => {
    if (modalOpen) {
      fetchCities();
    }
  }, [modalOpen]);

  useEffect(() => {
    // whenever the selected city changes, reset child selections
    if (!formData.city) {
      setPincodes([]);
      setFormData((prev) => ({ ...prev, pincode: '', area: '', location: '' }));
      return;
    }

    fetchPincodes(formData.city);
  }, [formData.city]);

  useEffect(() => {
    if (!formData.pincode) {
      setAreas([]);
      setFormData((prev) => ({ ...prev, area: '', location: '' }));
      return;
    }

    fetchAreas(formData.pincode);
  }, [formData.pincode]);

  useEffect(() => {
    if (!formData.area) {
      setLocations([]);
      setFormData((prev) => ({ ...prev, location: '' }));
      return;
    }

    fetchLocations(formData.area);
  }, [formData.area]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setDebugInfo('');
      const response = await slotsAPI.getAll();
      const responseData = response?.data;
      let apiSlots = [];

      if (Array.isArray(responseData?.data?.slots)) apiSlots = responseData.data.slots;
      else if (Array.isArray(responseData?.slots)) apiSlots = responseData.slots;
      else if (Array.isArray(responseData?.data)) apiSlots = responseData.data;
      else if (Array.isArray(responseData)) apiSlots = responseData;

      setSlots(apiSlots);
      setDebugInfo(`Fetched successfully. Total slots: ${apiSlots.length}`);
    } catch (error) {
      setSlots([]);
      setDebugInfo(`Fetch failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const response = await citiesAPI.getAll();
      const list = response?.data?.data?.cities || [];
      setCities(list);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchPincodes = async (cityValue) => {
    try {
      setLoadingPincodes(true);
      const response = await pincodesAPI.getAll();
      let list = response?.data?.data?.pincodes || [];

      // Filter by city if possible
      if (cityValue) {
        list = list.filter((item) => {
          // Support both field names `city` and `cityId`
          if (item.city) return item.city === cityValue;
          if (item.cityId) return item.cityId === cityValue;
          return true;
        });
      }

      setPincodes(list);
    } catch (error) {
      console.error('Error fetching pincodes:', error);
      setPincodes([]);
    } finally {
      setLoadingPincodes(false);
    }
  };

  const fetchAreas = async (pincodeValue) => {
    try {
      setLoadingAreas(true);
      const response = await areasAPI.getAll();
      let list = response?.data?.data?.areas || [];

      if (pincodeValue) {
        list = list.filter((item) => {
          if (item.pincode) return item.pincode === pincodeValue;
          if (item.pincodeId) return item.pincodeId === pincodeValue;
          return true;
        });
      }

      setAreas(list);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  const fetchLocations = async (areaValue) => {
    try {
      setLoadingLocations(true);
      const response = await locationsAPI.getAll();
      let list = response?.data?.data?.locations || [];

      if (areaValue) {
        list = list.filter((item) => {
          if (item.area) return item.area === areaValue;
          if (item.areaId) return item.areaId === areaValue;
          return true;
        });
      }

      setLocations(list);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };
  // 2. Implement the filtering logic
  const filteredSlots = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return slots;

    return slots.filter((slot) => {
      return (
        slot.city?.toLowerCase().includes(lowerSearch) ||
        slot.area?.toLowerCase().includes(lowerSearch) ||
        slot.slotLocation?.toLowerCase().includes(lowerSearch) ||
        slot.pincode?.toString().includes(lowerSearch) ||
        slot.landmark?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [slots, searchTerm]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingSlot(null);
    setFormData(initialFormData);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      city: slot.city || slot.cityId || '',
      pincode: slot.pincode || slot.pincodeId || '',
      area: slot.area || slot.areaId || '',
      location: slot.location || slot.locationId || '',
      landmark: slot.landmark || '',
      vehicleType: slot.vehicleType || 'car',
      slotType: slot.slotType || 'normal',
      slotLocation: slot.slotLocation || '',
      price: slot.price ?? '',
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.city) return 'City is required';
    if (!formData.pincode) return 'Pincode is required';
    if (!formData.area) return 'Area is required';
    if (!formData.location) return 'Location is required';
    if (!formData.landmark.trim()) return 'Landmark is required';
    if (!['car', 'bike'].includes(formData.vehicleType)) return 'Vehicle type must be car or bike';
    if (!['normal', 'ev', 'disabled'].includes(formData.slotType)) return 'Invalid slot type';
    if (!formData.slotLocation.trim()) return 'Slot location is required';
    if (formData.price === '' || Number.isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      return 'Enter a valid price';
    }
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
      city: formData.city,
      pincode: formData.pincode,
      area: formData.area,
      location: formData.location,
      landmark: formData.landmark.trim(),
      vehicleType: formData.vehicleType,
      slotType: formData.slotType,
      slotLocation: formData.slotLocation.trim(),
      price: Number(formData.price),
    };
    if (validationError) { alert(validationError); return; }

    const payload = { ...formData, price: Number(formData.price) };
    try {
      setSubmitting(true);
      if (editingSlot) await slotsAPI.update(editingSlot._id, payload);
      else await slotsAPI.create(payload);
      await fetchSlots();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to save slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await slotsAPI.delete(id);
      await fetchSlots();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const columns = [
    { 
        header: 'CITY', 
        render: (row) => <span className="font-bold text-gray-800 dark:text-gray-100">{row.city}</span> 
    },
    { 
        header: 'AREA', 
        render: (row) => <span className="text-slate-600 dark:text-slate-300 font-medium">{row.area}</span> 
    },
    { 
        header: 'PINCODE', 
        render: (row) => (
            <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg font-bold text-xs border border-blue-100 dark:border-blue-800 font-mono">
                {row.pincode}
            </span>
        ) 
    },
    { 
        header: 'LANDMARK', 
        render: (row) => <span className="text-slate-500 dark:text-slate-400 text-sm">{row.landmark}</span> 
    },
    { 
      header: 'VEHICLE', 
      render: (row) => (
        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ring-1 ring-inset ${
          row.vehicleType === 'car' 
            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-600/20' 
            : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-indigo-600/20'
        }`}>
          {row.vehicleType}
        </span>
      ) 
    },
    { 
      header: 'SLOT TYPE', 
      render: (row) => (
        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ring-1 ring-inset ${
          row.slotType === 'ev' 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20' 
            : row.slotType === 'disabled'
            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 ring-amber-600/20'
            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 ring-slate-600/20'
        }`}>
          {row.slotType === 'ev' ? <MdElectricBolt className="inline mr-1" /> : row.slotType === 'disabled' ? <FaWheelchair className="inline mr-1" /> : <FaCar className="inline mr-1" />}
          {row.slotType}
        </span>
      ) 
    },
    { 
      header: 'SLOT LOCATION', 
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
          <FaHashtag size={10} className="text-slate-400" />
          {row.slotLocation}
        </div>
      ) 
    },
    { 
      header: 'PRICE', 
      render: (row) => (
        <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-black border border-emerald-100 dark:border-emerald-800">
          ₹{row.price}
        </span>
      ) 
    },
    { 
      header: 'ACTIONS', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(row)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg group transition-colors">
            <FaEdit size={14} className="group-active:scale-90 transition-transform"/>
          </button>
          <button onClick={() => handleDelete(row._id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg group transition-colors">
            <FaTrash size={14} className="group-active:scale-90 transition-transform"/>
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
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Parking Slots</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage all available parking spaces and details</p>
          {debugInfo && <p className="text-[10px] text-slate-400 font-mono mt-1 opacity-60">{debugInfo}</p>}
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              value={searchTerm} // 3. Bind the value
              onChange={(e) => setSearchTerm(e.target.value)} // 4. Update state on change
              placeholder="Search city, area, or location..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"
            />
          </div>
          <button 
            onClick={openCreateModal}
            className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
          >
            <FaPlus size={20} />
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        <Table 
          columns={columns} 
          data={filteredSlots} // 5. Pass filtered data instead of raw slots
          loading={loading} 
        />
        
        {!loading && filteredSlots.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 dark:text-slate-500 font-medium">
              {searchTerm ? `No results found matching "${searchTerm}"` : "No parking slots found"}
            </p>
          </div>
        )}
      </div>

      {/* Modal Section stays the same */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingSlot ? 'Edit Slot' : 'Add Slot'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city._id || city.name} value={city._id || city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pincode
              </label>
              <select
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                disabled={!formData.city}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-900/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">{!formData.city ? 'Select a city first' : 'Select a pincode'}</option>
                {pincodes.map((pincode) => (
                  <option key={pincode._id || pincode.name} value={pincode._id || pincode.name}>
                    {pincode.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Area
              </label>
              <select
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                disabled={!formData.pincode}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-900/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">{!formData.pincode ? 'Select a pincode first' : 'Select an area'}</option>
                {areas.map((area) => (
                  <option key={area._id || area.name} value={area._id || area.name}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!formData.area}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-900/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">{!formData.area ? 'Select an area first' : 'Select a location'}</option>
                {locations.map((location) => (
                  <option key={location._id || location.name} value={location._id || location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Landmark
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vehicle Type
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slot Type
              </label>
              <select
                value={formData.slotType}
                onChange={(e) => handleInputChange('slotType', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="normal">Normal</option>
                <option value="ev">EV</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slot Location
              </label>
              <input
                type="text"
                value={formData.slotLocation}
                onChange={(e) => handleInputChange('slotLocation', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
        <form onSubmit={handleSubmit} className="p-2 space-y-5">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Landmark</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => handleInputChange('landmark', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Slot Type</label>
                <select
                  value={formData.slotType}
                  onChange={(e) => handleInputChange('slotType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="ev">EV</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Slot Location</label>
                <input
                  type="text"
                  value={formData.slotLocation}
                  onChange={(e) => handleInputChange('slotLocation', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                  required
                />
              </div>
           </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ParkingSlots;