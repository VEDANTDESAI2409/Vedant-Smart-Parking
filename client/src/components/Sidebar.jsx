import React, { useState, useEffect } from 'react';
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
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronRight,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [isServiceLocationOpen, setIsServiceLocationOpen] = useState(false);

  const serviceLocationPaths = ['/admin/city', '/admin/pincode', '/admin/area', '/admin/location'];

  useEffect(() => {
    if (serviceLocationPaths.includes(location.pathname)) {
      setIsServiceLocationOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/admin/parking-slots', label: 'Parking Slots', icon: FaParking },
    { path: '/admin/bookings', label: 'Bookings', icon: FaCalendarAlt },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/vehicles', label: 'Vehicles', icon: FaCar },
    { path: '/admin/payments', label: 'Payments', icon: FaCreditCard },
    {
      label: 'Manage Service Location',
      icon: FaMapMarkerAlt,
      submenu: [
        { path: '/admin/city', label: 'City' },
        { path: '/admin/pincode', label: 'Pincode' },
        { path: '/admin/area', label: 'Area' },
        { path: '/admin/location', label: 'Location' },
      ],
    },
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
        } overflow-y-auto h-full`}
      >
        <div className="flex items-center justify-center h-16 px-4 bg-primary-600 dark:bg-primary-700">
          <h1 className="text-xl font-bold text-white">ParkNGo Admin</h1>
        </div>

        <nav className="mt-8">
          <div className="px-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = item.path ? location.pathname === item.path : false;
              const isSubmenuActive = item.submenu && item.submenu.some(sub => location.pathname === sub.path);

              if (item.submenu) {
                return (
                  <div key={index}>
                    <button
                      onClick={() => setIsServiceLocationOpen(!isServiceLocationOpen)}
                      className={`flex items-center justify-between w-full px-4 py-3 mt-2 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
                        isSubmenuActive
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </div>
                      {isServiceLocationOpen ? <FaChevronDown className="w-4 h-4" /> : <FaChevronRight className="w-4 h-4" />}
                    </button>
                    {isServiceLocationOpen && (
                      <div className="ml-8 mt-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`flex items-center px-4 py-2 mt-1 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
                                isSubActive
                                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                              }`}
                              onClick={toggleSidebar}
                            >
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

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