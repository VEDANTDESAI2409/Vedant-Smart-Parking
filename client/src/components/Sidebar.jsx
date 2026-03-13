import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaParking,
  FaCalendarAlt,
  FaUsers,
  FaCar,
  FaCreditCard,
  FaChartBar,
  FaCog,
  FaUser,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/admin/parking-slots', label: 'Parking Slots', icon: FaParking },
    { path: '/admin/bookings', label: 'Bookings', icon: FaCalendarAlt },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/vehicles', label: 'Vehicles', icon: FaCar },
    { path: '/admin/payments', label: 'Payments', icon: FaCreditCard },
    { path: '/admin/reports', label: 'Reports', icon: FaChartBar },
    { path: '/admin/settings', label: 'Settings', icon: FaCog },
    { path: '/admin/profile', label: 'Profile', icon: FaUser },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 dark:bg-gray-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 px-4 bg-primary-600 dark:bg-primary-700">
          <h1 className="text-xl font-bold text-white">ParkNGo Admin</h1>
        </div>

        <nav className="mt-8">
          <div className="px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 mt-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                  onClick={toggleSidebar}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;