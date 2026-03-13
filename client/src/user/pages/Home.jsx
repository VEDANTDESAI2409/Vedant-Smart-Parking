import React from 'react';
import { Link } from 'react-router-dom';
import { FaParking, FaSearch, FaCalendarAlt, FaHistory, FaUser } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FaParking className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">ParkNGo</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">Home</Link>
              <Link to="/search" className="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">Find Parking</Link>
              <Link to="/booking" className="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">My Bookings</Link>
              <Link to="/profile" className="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">Profile</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Find Your Perfect Parking Spot
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Smart parking system that helps you find, reserve, and pay for parking spaces effortlessly.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/search"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Find Parking Now
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <FaSearch className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Easy Search</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Find available parking spots in seconds
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto">
                <FaCalendarAlt className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Instant Booking</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Reserve your spot with just a few clicks
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto">
                <FaHistory className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Booking History</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Keep track of all your parking reservations
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mx-auto">
                <FaUser className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">User Profile</h3>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="px-6 py-12 sm:px-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Ready to Park Smart?
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                Join thousands of users who trust ParkNGo for their parking needs.
              </p>
              <div className="mt-8">
                <Link
                  to="/search"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;