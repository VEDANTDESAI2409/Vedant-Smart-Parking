import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Button from '../../components/Button';
import Card from '../../components/Card';

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');

  // Dummy data for reports
  const revenueData = [
    { month: 'Jan', revenue: 3200, bookings: 120 },
    { month: 'Feb', revenue: 4100, bookings: 145 },
    { month: 'Mar', revenue: 3800, bookings: 132 },
    { month: 'Apr', revenue: 5200, bookings: 168 },
    { month: 'May', revenue: 4800, bookings: 156 },
    { month: 'Jun', revenue: 6100, bookings: 189 },
  ];

  const occupancyData = [
    { day: 'Mon', occupied: 85 },
    { day: 'Tue', occupied: 92 },
    { day: 'Wed', occupied: 78 },
    { day: 'Thu', occupied: 95 },
    { day: 'Fri', occupied: 88 },
    { day: 'Sat', occupied: 65 },
    { day: 'Sun', occupied: 45 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <div className="flex space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button>
            <FaDownload className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Trend" className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Weekly Occupancy" className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="occupied" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Summary Statistics" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">$45,230</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">1,247</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">87%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Occupancy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">523</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Registered Vehicles</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;