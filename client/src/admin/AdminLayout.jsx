import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { getAdminPreferences, subscribeToAdminPreferences } from '../utils/adminPreferences';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [adminPreferences, setAdminPreferences] = useState(getAdminPreferences());

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => subscribeToAdminPreferences(setAdminPreferences), []);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', adminPreferences.reducedMotion);
  }, [adminPreferences.reducedMotion]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.10),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.09),_transparent_20%),linear-gradient(180deg,_#f8fbff_0%,_#eef3f8_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.16),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.10),_transparent_18%),linear-gradient(180deg,_#04111d_0%,_#071521_100%)] dark:text-slate-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] [background-size:32px_32px] dark:opacity-35" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/40 to-transparent dark:from-teal-400/5" />
        <Navbar
          toggleSidebar={toggleSidebar}
          toggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
          systemName={adminPreferences.systemName}
        />

        <main className="relative flex-1 overflow-x-hidden overflow-y-auto">
          <div
            className={`mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 ${
              adminPreferences.compactMode ? 'py-4 lg:py-5' : 'py-6 lg:py-8'
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
