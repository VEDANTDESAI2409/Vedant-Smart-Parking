import React, { useState, useEffect } from 'react';
import { FaParking, FaCalendarAlt, FaUsers, FaCar, FaCreditCard, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/Card';
import { reportsAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reportsAPI.getDashboardStats();
      setStats(response.data?.data || null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Parking Slots',
      value: stats?.totalSlots ?? 'No data',
      icon: FaParking,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Occupied Slots',
      value: stats ? `${stats.occupiedSlots}/${stats.totalSlots}` : 'No data',
      icon: FaParking,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Bookings',
      value: stats?.activeBookings ?? 'No data',
      icon: FaCalendarAlt,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 'No data',
      icon: FaUsers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Total Vehicles',
      value: stats?.totalVehicles ?? 'No data',
      icon: FaCar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Revenue',
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : 'No data',
      icon: FaCreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card title="Monthly Revenue" className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Occupancy Chart */}
        <Card title="Daily Occupancy Trend" className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="occupied" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Booking Status Pie Chart */}
      <Card title="Booking Status Distribution" className="p-6">
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.bookingStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.bookingStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;