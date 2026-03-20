import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminRoutes from './routes/AdminRoutes';
// User components will be added later
import UserHome from './user/pages/Home';
import UserSearch from './user/pages/Search';
import UserBooking from './user/pages/Booking';
import UserHistory from './user/pages/History';
import UserProfile from './user/pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* User Routes */}
          <Route path="/" element={<UserHome />} />
          <Route path="/search" element={<UserSearch />} />
          <Route path="/booking" element={<UserBooking />} />
          <Route path="/history" element={<UserHistory />} />
          <Route path="/profile" element={<UserProfile />} />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
