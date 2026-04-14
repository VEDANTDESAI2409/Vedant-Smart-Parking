import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCar, FaMotorcycle, FaTruck, FaTimes, FaSearch } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { vehiclesAPI } from '../../services/api';
import SearchableSelect from '../../components/SearchableSelect';
import Button from '../../components/Button';
import Table from '../../components/Table';
import { shouldConfirmBulkDelete } from '../../utils/adminPreferences';
import { showError, showSuccess, showWarning } from '../../utils/toastService';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);

  const [formData, setFormData] = useState({
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vehicleType: 'car',
    fuelType: 'petrol',
    registrationExpiry: ''
  });

  useEffect(() => {
    fetchVehicles();
    // Refresh data every 30 seconds to show new vehicle registrations automatically
    const interval = setInterval(fetchVehicles, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedVehicleIds((prev) => prev.filter((id) => vehicles.some((vehicle) => (vehicle._id || vehicle.id) === id)));
  }, [vehicles]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehiclesAPI.getAll({ limit: 1000, page: 1 });
      const data = response.data?.data?.vehicles || response.data?.vehicles || response.data || [];
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally { setLoading(false); }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        licensePlate: formData.licensePlate.toUpperCase().replace(/\s/g, ''),
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        color: formData.color,
        vehicleType: formData.vehicleType,
        fuelType: formData.fuelType,
        registrationExpiry: formData.registrationExpiry
      };

      let response;
      if (editingId) {
        response = await vehiclesAPI.update(editingId, payload);
      } else {
        response = await vehiclesAPI.create(payload);
      }

      if (response.status === 200 || response.status === 201 || response.data.success) {
        await fetchVehicles();
        closeModal();
        showSuccess(editingId ? 'Vehicle updated successfully' : 'Vehicle created successfully');
      }
    } catch (error) {
      console.error('Submit error details:', error.response?.data);
      const msg = error.response?.data?.message || "Check console for validation errors.";
      showError(msg);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Vehicle?',
      text: 'This vehicle will be removed from the fleet list.',
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

    if (!result.isConfirmed) {
      return;
    }

    try {
      await vehiclesAPI.delete(id);
      await fetchVehicles();
      showSuccess('Vehicle deleted successfully');
    } catch (error) {
      console.error('Delete error details:', error.response?.data);
      showError(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const openEditModal = (vehicle) => {
    setEditingId(vehicle._id || vehicle.id);
    setFormData({
      licensePlate: vehicle.licensePlate || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || new Date().getFullYear(),
      color: vehicle.color || '',
      vehicleType: vehicle.vehicleType || 'car',
      fuelType: vehicle.fuelType || 'petrol',
      registrationExpiry: vehicle.registrationExpiry ? vehicle.registrationExpiry.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      licensePlate: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      vehicleType: 'car',
      fuelType: 'petrol',
      registrationExpiry: '',
    });
  };

  const formatIndianPlate = (plate) => {
    if (!plate) return '';
    return plate.toUpperCase().replace(/\s/g, '');
  };

  const filteredVehicles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return vehicles;
    }

    return vehicles.filter((vehicle) =>
      [vehicle.licensePlate, vehicle.make, vehicle.model]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [vehicles, searchTerm]);

  const handleVehicleSelect = (id, checked) => {
    setSelectedVehicleIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((selectedId) => selectedId !== id)
    );
  };

  const handleSelectAllVehicles = (checked) => {
    setSelectedVehicleIds(checked ? filteredVehicles.map((vehicle) => vehicle._id || vehicle.id).filter(Boolean) : []);
  };

  const handleBulkDelete = async () => {
    if (!selectedVehicleIds.length) {
      showWarning('Please select at least one vehicle');
      return;
    }

    if (shouldConfirmBulkDelete()) {
      const result = await Swal.fire({
        title: 'Delete Selected Vehicles?',
        text: `Delete ${selectedVehicleIds.length} selected vehicles? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete Selected',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '12px',
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      const results = await Promise.allSettled(selectedVehicleIds.map((id) => vehiclesAPI.delete(id)));
      const successCount = results.filter((item) => item.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      await fetchVehicles();
      setSelectedVehicleIds([]);

      if (successCount) {
        showSuccess(
          failureCount
            ? `${successCount} vehicles deleted, ${failureCount} failed`
            : `${successCount} vehicles deleted successfully`
        );
      } else {
        showError('Failed to delete selected vehicles');
      }
    } catch (error) {
      console.error('Bulk delete vehicles error:', error);
      showError('Failed to delete selected vehicles');
    }
  };

  const columns = [
    { 
      header: 'LICENSE PLATE', 
      render: (row) => (
        <div className="flex min-w-[240px] max-w-[320px] items-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/80 dark:shadow-none">
          <div className="flex h-14 w-9 flex-col items-center justify-center bg-blue-700 text-[7px] font-black leading-none tracking-[0.24em] text-white">
            <span>I</span>
            <span>N</span>
            <span>D</span>
          </div>
          <div className="flex flex-1 items-center justify-between px-4">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                License Plate
              </p>
              <p className="mt-1 whitespace-nowrap font-mono text-[15px] font-black tracking-[0.18em] text-slate-900 dark:text-white">
                {formatIndianPlate(row.licensePlate)}
              </p>
            </div>
            <div className="ml-3 shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-700/70 dark:text-slate-300">
              {row.vehicleType || 'car'}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'VEHICLE INFO', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 dark:text-slate-100">{row.make} {row.model}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
             <span className="text-slate-400">{row.vehicleType === 'motorcycle' ? <FaMotorcycle size={12}/> : row.vehicleType === 'truck' ? <FaTruck size={12}/> : <FaCar size={12}/>}</span>
             <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{row.vehicleType}</span>
             <span className="text-[10px] text-slate-300">•</span>
             <span className="text-[10px] text-slate-400 font-semibold">{row.year} • {row.color}</span>
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
    { header: 'OWNER', render: (row) => (
      <div className="flex flex-col text-sm text-slate-700 dark:text-slate-300">
        <span className="font-bold">{row.owner?.name || '---'}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{row.owner?.email || '---'}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{row.owner?.phone || '---'}</span>
      </div>
    ) },
    { 
      header: 'ACTIONS', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:scale-110 transition-transform">
            <FaEdit size={14}/>
          </button>
          <button onClick={() => handleDelete(row._id || row.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:scale-110 transition-transform">
            <FaTrash size={14}/>
          </button>
        </div>
      )
    },
  ];

  const vehicleTypeOptions = [
    { value: 'car', label: 'Car' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'truck', label: 'Truck' },
    { value: 'van', label: 'Van' },
    { value: 'suv', label: 'SUV' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const fuelTypeOptions = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'cng', label: 'CNG' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'other', label: 'Other' },
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
              value={searchTerm}
              placeholder="Search plate or model..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl outline-none transition-all text-sm dark:text-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedVehicleIds.length > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              <FaTrash className="mr-2" />
              {`Delete Selected (${selectedVehicleIds.length})`}
            </Button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 font-bold text-sm"
          >
            <FaPlus /> ADD VEHICLE
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <Table
          columns={columns}
          data={filteredVehicles}
          loading={loading}
          emptyMessage={searchTerm.trim() ? `No vehicles found matching "${searchTerm}"` : 'No vehicles found. Click "Add Vehicle" to start.'}
          selectable
          selectedRowIds={selectedVehicleIds}
          onRowSelect={handleVehicleSelect}
          onSelectAll={handleSelectAllVehicles}
          getRowId={(row) => row._id || row.id}
          className="rounded-[2rem] border-0 bg-transparent shadow-none dark:bg-transparent"
        />
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Vehicle Type</label>
                  <SearchableSelect
                    value={formData.vehicleType}
                    onChange={(value) => setFormData((prev) => ({ ...prev, vehicleType: value }))}
                    options={vehicleTypeOptions}
                    placeholder="Select vehicle type"
                    className="[&>button]:mt-0 [&>button]:rounded-xl [&>button]:border-none [&>button]:bg-slate-50 [&>button]:p-3 [&>button]:ring-1 [&>button]:ring-slate-200 dark:[&>button]:bg-slate-800 dark:[&>button]:ring-slate-700"
                    menuClassName="dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Fuel</label>
                  <SearchableSelect
                    value={formData.fuelType}
                    onChange={(value) => setFormData((prev) => ({ ...prev, fuelType: value }))}
                    options={fuelTypeOptions}
                    placeholder="Select fuel type"
                    className="[&>button]:mt-0 [&>button]:rounded-xl [&>button]:border-none [&>button]:bg-slate-50 [&>button]:p-3 [&>button]:ring-1 [&>button]:ring-slate-200 dark:[&>button]:bg-slate-800 dark:[&>button]:ring-slate-700"
                    menuClassName="dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Make</label>
                  <input
                    required
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-3 dark:text-white"
                    placeholder="e.g. Honda"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Model</label>
                  <input
                    required
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-3 dark:text-white"
                    placeholder="e.g. City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Year</label>
                  <input
                    required
                    type="number"
                    name="year"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-3 dark:text-white"
                    placeholder="2026"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Color</label>
                  <input
                    required
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-3 dark:text-white"
                    placeholder="e.g. Black"
                  />
                </div>
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
