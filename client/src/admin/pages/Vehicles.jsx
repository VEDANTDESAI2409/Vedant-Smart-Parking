import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCar, FaMotorcycle, FaTruck, FaTimes, FaSearch } from 'react-icons/fa';
import { vehiclesAPI } from '../../services/api';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    licensePlate: '',
    model: '',
    category: 'car',
    fuelType: 'petrol',
    registrationExpiry: ''
  });

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehiclesAPI.getAll();
      // Handling standard API response structure
      setVehicles(response.data?.data?.vehicles || response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FIXED CREATE OR UPDATE LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        licensePlate: formData.licensePlate.toUpperCase().replace(/\s/g, '') 
      };
      
      let response;
      if (editingId) {
        response = await vehiclesAPI.update(editingId, payload);
        if (response.data) {
          // Update local state for immediate feedback
          setVehicles(prev => prev.map(v => v._id === editingId ? (response.data.data || response.data) : v));
        }
      } else {
        response = await vehiclesAPI.create(payload);
      }

      // Refresh list and reset modal if successful
      await fetchVehicles();
      closeModal();
    } catch (error) {
      const msg = error.response?.data?.message || "Operation failed. Please check plate format.";
      alert(msg);
    }
  };

  // --- FIXED DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this vehicle?")) {
      try {
        await vehiclesAPI.delete(id);
        // Remove from local state immediately
        setVehicles(prev => prev.filter(v => v._id !== id));
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete vehicle");
      }
    }
  };

  const openEditModal = (vehicle) => {
    setEditingId(vehicle._id);
    setFormData({
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      category: vehicle.category,
      fuelType: vehicle.fuelType,
      registrationExpiry: vehicle.registrationExpiry ? vehicle.registrationExpiry.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ licensePlate: '', model: '', category: 'car', fuelType: 'petrol', registrationExpiry: '' });
  };

  const formatIndianPlate = (plate) => {
    if(!plate) return "";
    const clean = plate.toUpperCase().replace(/\s/g, '');
    const match = clean.match(/^([A-Z]{2})([0-9]{2})([A-Z]{1,2})([0-9]{4})$/);
    return match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : clean;
  };

  const columns = [
    { 
      header: 'LICENSE PLATE', 
      render: (row) => (
        <div className="flex items-center border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden shadow-sm w-32">
          <div className="bg-blue-700 w-3 h-7 flex flex-col items-center justify-center text-[5px] text-white font-bold leading-none">
            <span>I</span><span>N</span><span>D</span>
          </div>
          <div className="flex-1 text-center font-mono font-black text-slate-900 dark:text-white text-[11px]">
            {formatIndianPlate(row.licensePlate)}
          </div>
        </div>
      )
    },
    { 
      header: 'VEHICLE INFO', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 dark:text-slate-100">{row.model}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
             <span className="text-slate-400">{row.category === 'motorcycle' ? <FaMotorcycle size={12}/> : row.category === 'truck' ? <FaTruck size={12}/> : <FaCar size={12}/>}</span>
             <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{row.category}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'FUEL TYPE', 
      render: (row) => (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${
          row.fuelType === 'electric' ? 'bg-cyan-50 text-cyan-700 ring-cyan-600/20' : 
          row.fuelType === 'petrol' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-800 text-white ring-slate-600/20'
        }`}>
          {row.fuelType}
        </span>
      )
    },
    { header: 'OWNER', render: (row) => <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{row.owner?.name || '---'}</span> },
    { 
      header: 'ACTIONS', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:scale-110 transition-transform">
            <FaEdit size={14}/>
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:scale-110 transition-transform">
            <FaTrash size={14}/>
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-6 lg:p-10 font-sans transition-colors duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Fleet Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your registered vehicles</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search plate or model..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl outline-none transition-all text-sm dark:text-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 font-bold text-sm"
          >
            <FaPlus /> ADD VEHICLE
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-400">Loading fleet...</td></tr>
            ) : (
              vehicles
                .filter(v => (v.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) || v.model?.toLowerCase().includes(searchTerm.toLowerCase())))
                .map((row, i) => (
                  <tr key={row._id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    {columns.map((col, j) => (
                      <td key={j} className="px-6 py-4">{col.render(row)}</td>
                    ))}
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center p-8 border-b dark:border-slate-800">
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                  {editingId ? 'Update Record' : 'Fleet Entry'}
                </span>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {editingId ? 'Edit Vehicle' : 'Add Vehicle'}
                </h2>
              </div>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600"><FaTimes /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">License Plate</label>
                <input 
                  required 
                  name="licensePlate" 
                  value={formData.licensePlate} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-3 font-mono uppercase dark:text-white" 
                  placeholder="GJ05AB1234" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-3 dark:text-white">
                    <option value="car">Car</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Fuel</label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-3 dark:text-white">
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Model Name</label>
                <input required name="model" value={formData.model} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-3 dark:text-white" placeholder="e.g. Toyota Camry" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Registration Expiry</label>
                <input required type="date" name="registrationExpiry" value={formData.registrationExpiry} onChange={handleInputChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-3 dark:text-white" />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl py-4 font-bold text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white rounded-2xl py-4 font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 text-sm">
                  {editingId ? 'Update' : 'Save'} Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;