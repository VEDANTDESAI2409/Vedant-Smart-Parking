import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Admin Pages
import Login from '../admin/pages/Login';
import Dashboard from '../admin/pages/Dashboard';
import ParkingSlots from '../admin/pages/ParkingSlots';
import Bookings from '../admin/pages/Bookings';
import Users from '../admin/pages/Users';
import Vehicles from '../admin/pages/Vehicles';
import Payments from '../admin/pages/Payments';
import Reports from '../admin/pages/Reports';
import Settings from '../admin/pages/Settings';
import Profile from '../admin/pages/Profile';

// Layout
import AdminLayout from '../admin/AdminLayout';

const AdminRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="parking-slots" element={<ParkingSlots />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="users" element={<Users />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="payments" element={<Payments />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AdminRoutes;