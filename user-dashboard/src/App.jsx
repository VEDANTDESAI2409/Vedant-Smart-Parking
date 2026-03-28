import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { getAdminPreferences, subscribeToAdminPreferences } from './utils/adminPreferences';
import Home from './user/pages/Home';
import Search from './user/pages/Search';
import Booking from './user/pages/Booking';
import History from './user/pages/History';
import Profile from './user/pages/Profile';
import Login from './user/pages/Login';
import Signup from './user/pages/Signup';

const AppShell = () => {
  const [adminPreferences, setAdminPreferences] = React.useState(getAdminPreferences());

  React.useEffect(() => subscribeToAdminPreferences(setAdminPreferences), []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<Search />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
