import React, { useState, useEffect, useMemo } from 'react';
import { FaFileCsv, FaSearch, FaTrash, FaPhone, FaEdit, FaEnvelope } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Table from '../../components/Table';
import { usersAPI } from '../../services/api';
import { showSuccess } from '../../utils/toastService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    // Refresh data every 30 seconds to show new registrations automatically
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll({ limit: 1000, page: 1 });
      const rawData = response.data?.data?.users || [];
      
      const formatted = rawData.map((u, index) => ({
        ...u,
        customId: `U${String(index + 1).padStart(3, '0')}`,
        vehicleCount: u.vehicles?.length || 0,
        lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-GB', { hour12: false }) : 'Never',
        joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : 'N/A',
      }));
      setUsers(formatted);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase().trim();
    if (!lowerSearch) return users;

    return users.filter(u => {
      return (
        u.name?.toLowerCase().includes(lowerSearch) ||
        u.email?.toLowerCase().includes(lowerSearch) ||
        u.phone?.toString().includes(lowerSearch) ||
        u.customId?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [users, searchTerm]);

  const handleUpdate = (user) => {
    console.log("Edit user:", user);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: 'This user will be removed from the list.',
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

    if (result.isConfirmed) {
      setUsers(prev => prev.filter(user => user._id !== id));
      showSuccess('User deleted successfully');
    }
  };

  const handleExportCSV = () => {
    const headers = ["User ID,Name,Email,Phone,Status"];
    const rows = filteredUsers.map(u => [
      u.customId,
      `"${u.name}"`,
      u.email,
      u.phone,
      u.isActive ? 'Active' : 'Inactive'
    ].join(","));

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Users_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const columns = [
    { 
      header: 'USER ID', 
      render: (row) => (
        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg font-bold text-xs border border-blue-100 dark:border-blue-800 font-mono">
          {row.customId}
        </span>
      ) 
    },
    { 
      header: 'NAME', 
      render: (row) => <span className="font-bold text-gray-800 dark:text-gray-100">{row.name}</span> 
    },
    { 
      header: 'MOBILE', 
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <FaPhone size={10} className="text-slate-400" />
          {row.phone || '---'}
        </div>
      ) 
    },
    { 
      header: 'EMAIL', 
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <FaEnvelope size={12} className="opacity-70" />
          {row.email || '---'}
        </div>
      ) 
    },
    { 
      header: 'ROLE', 
      render: (row) => (
        <span className="text-xs uppercase tracking-[0.18em] font-bold text-slate-600 dark:text-slate-300">
          {row.role || 'user'}
        </span>
      ) 
    },
    { 
      header: 'VEHICLES', 
      render: (row) => (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {row.vehicleCount}
        </span>
      ) 
    },
    { 
      header: 'LAST LOGIN', 
      render: (row) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">{row.lastLogin}</span>
      ) 
    },
    { 
      header: 'STATUS', 
      render: (row) => (
        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ring-1 ring-inset ${
          row.isActive 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20' 
            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 ring-slate-600/20'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
    { 
      header: 'ACTION', 
      render: (row) => (
        <div className="flex items-center gap-2">
            <button onClick={() => handleUpdate(row)} className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg group">
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
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Users</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage customer accounts and bookings</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              value={searchTerm}
              placeholder="Search name, email, or phone..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="p-3.5 bg-white dark:bg-[#1E293B] ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl shadow-sm text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FaFileCsv size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        <Table 
          columns={columns} 
          data={filteredUsers} 
          loading={loading} 
        />
        
        {!loading && filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 dark:text-slate-500 font-medium">No users found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
