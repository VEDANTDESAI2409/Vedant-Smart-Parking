import React, { useState, useEffect, useMemo } from 'react';
import { FaFileCsv, FaSearch, FaTrash, FaPhone, FaEdit, FaEnvelope, FaCalendarAlt, FaEye } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Modal from '../../components/Modal';
import { usersAPI } from '../../services/api';
import { shouldConfirmBulkDelete } from '../../utils/adminPreferences';
import { showError, showSuccess, showWarning } from '../../utils/toastService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', address: '', isActive: true });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUsers();
    // Refresh data every 5 seconds for real-time login status updates
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedUserIds((prev) => prev.filter((id) => users.some((user) => user._id === id)));
  }, [users]);

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

    return users.filter((u) => (
      u.name?.toLowerCase().includes(lowerSearch) ||
      u.email?.toLowerCase().includes(lowerSearch) ||
      u.phone?.toString().includes(lowerSearch) ||
      u.address?.toLowerCase().includes(lowerSearch) ||
      u.customId?.toLowerCase().includes(lowerSearch) ||
      u.joinDate?.toLowerCase().includes(lowerSearch)
    ));
  }, [users, searchTerm]);

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      isActive: Boolean(user.isActive),
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditData({ name: '', email: '', phone: '', address: '', isActive: true });
  };

  const openDetailsModal = async (user) => {
    try {
      const response = await usersAPI.getById(user._id);
      setUserDetails(response.data.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showError('Failed to load user details');
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setUserDetails(null);
  };

  const handleToggleStatus = async (user) => {
    try {
      const updated = { isActive: !Boolean(user.isActive) };
      await usersAPI.update(user._id, updated);
      showSuccess(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      await fetchUsers();
    } catch (error) {
      console.error('Toggle user status error:', error);
      showError(error?.response?.data?.message || 'Failed to update status');
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingUser) return;

    try {
      await usersAPI.update(editingUser._id, {
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        address: editData.address,
        isActive: editData.isActive,
      });
      showSuccess('User updated successfully');
      closeEditModal();
      await fetchUsers();
    } catch (error) {
      console.error('Update user error:', error);
      showError(error?.response?.data?.message || 'Failed to update user');
    }
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
      try {
        await usersAPI.delete(id);
        await fetchUsers();
        showSuccess('User deleted successfully');
      } catch (error) {
        console.error('Delete user error:', error);
        showError(error?.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleUserSelect = (id, checked) => {
    setSelectedUserIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((selectedId) => selectedId !== id)
    );
  };

  const handleSelectAllUsers = (checked) => {
    setSelectedUserIds(checked ? filteredUsers.map((user) => user._id).filter(Boolean) : []);
  };

  const handleBulkDelete = async () => {
    if (!selectedUserIds.length) {
      showWarning('Please select at least one user');
      return;
    }

    if (shouldConfirmBulkDelete()) {
      const result = await Swal.fire({
        title: 'Delete Selected Users?',
        text: `Delete ${selectedUserIds.length} selected users? This action cannot be undone.`,
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
      const results = await Promise.allSettled(selectedUserIds.map((id) => usersAPI.delete(id)));
      const successCount = results.filter((item) => item.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      await fetchUsers();
      setSelectedUserIds([]);

      if (successCount) {
        showSuccess(
          failureCount
            ? `${successCount} users deleted, ${failureCount} failed`
            : `${successCount} users deleted successfully`
        );
      } else {
        showError('Failed to delete selected users');
      }
    } catch (error) {
      console.error('Bulk delete users error:', error);
      showError('Failed to delete selected users');
    }
  };

  const handleExportCSV = () => {
    const headers = ['User ID,Name,Email,Phone,Address,Status,Joined Date'];
    const rows = filteredUsers.map((u) => [
      u.customId,
      `"${u.name}"`,
      u.email,
      u.phone,
      `"${u.address || ''}"`,
      u.isActive ? 'Active' : 'Inactive',
      u.joinDate,
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
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
      ),
    },
    {
      header: 'NAME',
      render: (row) => <span className="font-bold text-gray-800 dark:text-gray-100">{row.name}</span>,
    },
    {
      header: 'MOBILE',
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <FaPhone size={10} className="text-slate-400" />
          {row.phone || '---'}
        </div>
      ),
    },
    {
      header: 'EMAIL',
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <FaEnvelope size={12} className="opacity-70" />
          {row.email || '---'}
        </div>
      ),
    },
    {
      header: 'ADDRESS',
      render: (row) => (
        <span className="text-sm text-slate-500 dark:text-slate-400 max-w-32 truncate block" title={row.address || 'Not provided'}>
          {row.address || '---'}
        </span>
      ),
    },
    {
      header: 'JOINED DATE',
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <FaCalendarAlt size={12} className="opacity-70" />
          {row.joinDate}
        </div>
      ),
    },
    {
      header: 'ROLE',
      render: (row) => (
        <span className="text-xs uppercase tracking-[0.18em] font-bold text-slate-600 dark:text-slate-300">
          {row.role || 'user'}
        </span>
      ),
    },
    {
      header: 'VEHICLES',
      render: (row) => (
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {row.vehicleCount}
        </span>
      ),
    },
    {
      header: 'LAST LOGIN',
      render: (row) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">{row.lastLogin}</span>
      ),
    },
    {
      header: 'STATUS',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(row)}
          className={`inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer ${
            row.isActive
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          <span
            className={`relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-150 ${
              row.isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-150 ${
                row.isActive ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </span>
          <span>{row.isActive ? 'Online' : 'Offline'}</span>
        </button>
      ),
    },
    {
      header: 'ACTION',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openDetailsModal(row)} className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg group" title="View Details">
            <FaEye size={14} className="group-active:scale-90 transition-transform" />
          </button>
          <button onClick={() => openEditModal(row)} className="text-blue-500 hover:text-blue-700 transition-colors p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg group">
            <FaEdit size={14} className="group-active:scale-90 transition-transform" />
          </button>
          <button onClick={() => handleDelete(row._id)} className="text-red-500 hover:text-red-700 transition-colors p-2 bg-red-50 dark:bg-red-900/10 rounded-lg group">
            <FaTrash size={14} className="group-active:scale-90 transition-transform" />
          </button>
        </div>
      ),
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
              placeholder="Search name, email, phone, address, or date..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {selectedUserIds.length > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              <FaTrash className="mr-2" />
              {`Delete Selected (${selectedUserIds.length})`}
            </Button>
          )}
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
          emptyMessage={searchTerm.trim() ? `No users found matching "${searchTerm}"` : 'No users found'}
          selectable
          selectedRowIds={selectedUserIds}
          onRowSelect={handleUserSelect}
          onSelectAll={handleSelectAllUsers}
          getRowId={(row) => row._id}
        />
      </div>

      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={editingUser ? 'Edit User' : 'Edit User'} size="md">
        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Name</span>
              <input
                value={editData.name}
                onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email</span>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Phone</span>
              <input
                value={editData.phone}
                onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Address</span>
              <input
                value={editData.address || ''}
                onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Enter address"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status</span>
              <select
                value={editData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setEditData((prev) => ({ ...prev, isActive: e.target.value === 'active' }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeEditModal} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} title="User Details">
        {userDetails && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Name:</span>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{userDetails.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Email:</span>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{userDetails.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone:</span>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{userDetails.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Address:</span>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{userDetails.address || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status:</span>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${userDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {userDetails.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Joined:</span>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{new Date(userDetails.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Vehicles */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Vehicles ({userDetails.vehicles?.length || 0})</h3>
              {userDetails.vehicles && userDetails.vehicles.length > 0 ? (
                <div className="space-y-3">
                  {userDetails.vehicles.map((vehicle) => (
                    <div key={vehicle._id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">License Plate:</span>
                          <p className="text-sm text-slate-900 dark:text-white">{vehicle.licensePlate}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Make & Model:</span>
                          <p className="text-sm text-slate-900 dark:text-white">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Color:</span>
                          <p className="text-sm text-slate-900 dark:text-white">{vehicle.color}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Type:</span>
                          <p className="text-sm text-slate-900 dark:text-white">{vehicle.vehicleType}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No vehicles registered</p>
              )}
            </div>

            {/* Recent Bookings */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Bookings</h3>
              {userDetails.bookings && userDetails.bookings.length > 0 ? (
                <div className="space-y-3">
                  {userDetails.bookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Booking ID:</span>
                          <p className="text-sm text-slate-900 dark:text-white">{booking.bookingReference}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status:</span>
                          <p className="text-sm text-slate-900 dark:text-white">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Date:</span>
                          <p className="text-sm text-slate-900 dark:text-white">{new Date(booking.startTime).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Amount:</span>
                          <p className="text-sm text-slate-900 dark:text-white">₹{booking.pricing?.finalAmount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No bookings found</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
