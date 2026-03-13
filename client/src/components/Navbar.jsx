import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaMoon, FaSun, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ toggleSidebar, toggleDarkMode, isDarkMode }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 lg:hidden"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <h2 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white lg:ml-0">
            Welcome back, {user?.name || 'Admin'}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
          >
            {isDarkMode ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
          </button>

          <button
            onClick={logout}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <FaSignOutAlt className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;