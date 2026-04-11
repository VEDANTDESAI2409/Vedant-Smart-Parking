import React from 'react';
import { FaArrowLeft, FaBars, FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageLabels = {
  '/admin/dashboard': 'Dashboard Overview',
  '/admin/parking-slots': 'Parking Slot Management',
  '/admin/bookings': 'Booking Operations',
  '/admin/users': 'User Directory',
  '/admin/vehicles': 'Vehicle Registry',
  '/admin/payments': 'Payments Console',
  '/admin/city': 'City Management',
  '/admin/pincode': 'Pincode Management',
  '/admin/area': 'Area Management',
  '/admin/location': 'Location Management',
  '/admin/reports': 'Reports and Insights',
  '/admin/settings': 'System Settings',
  '/admin/profile': 'Profile',
};

const Navbar = ({ toggleSidebar, systemName }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const canGoBack = location.pathname !== '/admin/dashboard';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/admin/dashboard');
  };

  return (
    <header className="relative z-10 border-b border-sky-100 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-6 md:flex-nowrap md:items-center lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          >
            <FaBars className="h-4 w-4" />
          </button>

          {canGoBack && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <FaArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-700">
              {systemName || 'Administration'}
            </p>
            <h2 className="truncate text-lg font-black tracking-tight text-slate-900 sm:text-[1.55rem]">
              {pageLabels[location.pathname] || 'Admin Workspace'}
            </h2>
            <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
              Welcome back, {user?.name || 'Admin'}. Monitor activity and keep operations flowing smoothly.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto sm:flex-nowrap">
          <div className="hidden items-center gap-3 rounded-xl border border-sky-100 bg-white px-3.5 py-2 shadow-[0_12px_24px_rgba(148,163,184,0.08)] md:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-900/20">
              <FaShieldAlt className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-slate-900">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'Operations control'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(251,113,133,0.22)] transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <FaSignOutAlt className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
