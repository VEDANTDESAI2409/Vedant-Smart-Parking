import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Button from '../../components/Button';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { usersAPI } from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data?.data?.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Dummy data
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', status: 'active', createdAt: '2024-01-15T10:00:00Z' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', status: 'active', createdAt: '2024-01-14T10:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Phone', key: 'phone' },
    { header: 'Status', key: 'status', render: (row) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {row.status}
      </span>
    )},
    { header: 'Created', key: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Actions', key: 'actions', render: (row) => (
      <div className="flex space-x-2">
        <button className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
        <button className="text-red-600 hover:text-red-800"><FaTrash /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <Button><FaPlus className="mr-2" />Add User</Button>
      </div>
      <Card>
        <Table columns={columns} data={users} loading={loading} emptyMessage="No users found" />
      </Card>
    </div>
  );
};

export default Users;