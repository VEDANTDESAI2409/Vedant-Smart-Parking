import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { getAdminPreferences, subscribeToAdminPreferences } from '../utils/adminPreferences';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminPreferences, setAdminPreferences] = useState(getAdminPreferences());

  useEffect(() => {
    localStorage.setItem('darkMode', 'false');
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => subscribeToAdminPreferences(setAdminPreferences), []);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', adminPreferences.reducedMotion);
  }, [adminPreferences.reducedMotion]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(253,224,71,0.16),_transparent_22%),linear-gradient(180deg,_#fcfdfd_0%,_#eef7f7_44%,_#f7fbff_100%)] text-slate-900">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-100/55 to-transparent" />
        <Navbar
          toggleSidebar={toggleSidebar}
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
