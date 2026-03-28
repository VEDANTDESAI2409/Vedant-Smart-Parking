import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getAdminPreferences, subscribeToAdminPreferences } from './utils/adminPreferences';
import AdminLayout from './admin/AdminLayout';
import Login from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import ParkingSlots from './admin/pages/ParkingSlots';
import Bookings from './admin/pages/Bookings';
import Users from './admin/pages/Users';
import Vehicles from './admin/pages/Vehicles';
import Payments from './admin/pages/Payments';
import Reports from './admin/pages/Reports';
import Settings from './admin/pages/Settings';
import Profile from './admin/pages/Profile';
import CityPage from './admin/pages/CityPage';
import PincodePage from './admin/pages/PincodePage';
import AreaPage from './admin/pages/AreaPage';
import LocationPage from './admin/pages/LocationPage';

const ProtectedAdminRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/parking-slots" element={<ParkingSlots />} />
        <Route path="/admin/bookings" element={<Bookings />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/vehicles" element={<Vehicles />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/city" element={<CityPage />} />
        <Route path="/admin/pincode" element={<PincodePage />} />
        <Route path="/admin/area" element={<AreaPage />} />
        <Route path="/admin/location" element={<LocationPage />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

const AppShell = () => {
  const [adminPreferences, setAdminPreferences] = React.useState(getAdminPreferences());

  React.useEffect(() => subscribeToAdminPreferences(setAdminPreferences), []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/*" element={<ProtectedAdminRoutes />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={adminPreferences.toastDuration}
        hideProgressBar={adminPreferences.hideToastProgress}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </BrowserRouter>
  );
};

const App = () => (
  <AuthProvider>
    <AppShell />
  </AuthProvider>
);

export default App;
