import React from 'react';
import { FaBars, FaMoon, FaShieldAlt, FaSignOutAlt, FaSun } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
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

const Navbar = ({ toggleSidebar, toggleDarkMode, isDarkMode, systemName }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="relative z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-950/35">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            <FaBars className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-700 dark:text-teal-300">
              {systemName || 'Administration'}
            </p>
            <h2 className="truncate text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {pageLabels[location.pathname] || 'Admin Workspace'}
            </h2>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              Welcome back, {user?.name || 'Admin'}. Monitor activity and keep operations flowing smoothly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 md:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-900/20">
              <FaShieldAlt className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'Operations control'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
          >
            {isDarkMode ? <FaSun className="h-4 w-4" /> : <FaMoon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/20 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <FaSignOutAlt className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
