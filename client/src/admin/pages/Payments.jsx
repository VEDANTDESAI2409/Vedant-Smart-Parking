import React, { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import Table from '../../components/Table';
import Card from '../../components/Card';
import { paymentsAPI } from '../../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getAll();
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Dummy data
      setPayments([
        { id: 1, booking: { id: 1 }, user: { name: 'John Doe' }, amount: 10.00, method: 'credit_card', status: 'completed', createdAt: '2024-01-15T12:00:00Z' },
        { id: 2, booking: { id: 2 }, user: { name: 'Jane Smith' }, amount: 12.00, method: 'paypal', status: 'completed', createdAt: '2024-01-14T16:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Booking ID', key: 'booking', render: (row) => row.booking.id },
    { header: 'User', key: 'user', render: (row) => row.user.name },
    { header: 'Amount', key: 'amount', render: (row) => `$${row.amount}` },
    { header: 'Method', key: 'method' },
    { header: 'Status', key: 'status', render: (row) => (
      <span className={`px-2 py-1 text-xs rounded-full ${
        row.status === 'completed' ? 'bg-green-100 text-green-800' :
        row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {row.status}
      </span>
    )},
    { header: 'Date', key: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleString() },
    { header: 'Actions', key: 'actions', render: (row) => (
      <button className="text-blue-600 hover:text-blue-800"><FaEye /></button>
    )},
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
      <Card>
        <Table columns={columns} data={payments} loading={loading} emptyMessage="No payments found" />
      </Card>
    </div>
  );
};

export default Payments;