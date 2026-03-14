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
      {/* Login route - no layout */}
      <Route
        path="login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/admin/dashboard" replace />}
      />

      {/* Protected routes with layout */}
      <Route
        path="dashboard"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="parking-slots"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <ParkingSlots />
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="bookings"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Bookings />
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="users"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Users />
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="vehicles"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Vehicles />
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="payments"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Payments />
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="reports"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Reports />
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="settings"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Settings />
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="profile"
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Profile />
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      {/* Catch-all route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} replace />}
      />
    </Routes>
  );
};

export default AdminRoutes;