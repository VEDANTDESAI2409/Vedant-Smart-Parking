import React, { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaClock, FaDollarSign } from 'react-icons/fa';
import SearchableSelect from '../../components/SearchableSelect';

const Search = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    date: '',
    time: '',
    duration: '',
  });

  const [searchResults, setSearchResults] = useState([]);

  const durationOptions = [
    { value: '1', label: '1 hour' },
    { value: '2', label: '2 hours' },
    { value: '4', label: '4 hours' },
    { value: '8', label: '8 hours' },
    { value: '24', label: '24 hours' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Dummy search results
    setSearchResults([
      {
        id: 1,
        name: 'Downtown Parking Lot A',
        address: '123 Main St, Downtown',
        distance: '0.5 km',
        price: 5.00,
        available: true,
        rating: 4.5,
      },
      {
        id: 2,
        name: 'Central Garage',
        address: '456 Central Ave',
        distance: '1.2 km',
        price: 7.50,
        available: true,
        rating: 4.2,
      },
      {
        id: 3,
        name: 'Mall Parking',
        address: '789 Shopping Blvd',
        distance: '2.1 km',
        price: 4.00,
        available: false,
        rating: 4.0,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FaSearch className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Find Parking</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search for Parking</h2>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Enter location"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={searchParams.time}
                onChange={(e) => setSearchParams({ ...searchParams, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (hours)
              </label>
              <SearchableSelect
                value={searchParams.duration}
                onChange={(value) => setSearchParams({ ...searchParams, duration: value })}
                options={durationOptions}
                placeholder="Select duration"
                className="[&>button]:mt-0 [&>button]:rounded-md [&>button]:border-gray-300 dark:[&>button]:border-gray-600 dark:[&>button]:bg-gray-700"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaSearch className="inline mr-2" />
                Search Parking
              </button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Available Parking Spots</h3>
            {searchResults.map((spot) => (
              <div key={spot.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{spot.name}</h4>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <FaMapMarkerAlt className="mr-1" />
                      {spot.address} • {spot.distance} away
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <FaDollarSign className="mr-1" />
                      ${spot.price}/hour • ⭐ {spot.rating}
                    </div>
                  </div>
                  <div className="ml-4">
                    {spot.available ? (
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                        Book Now
                      </button>
                    ) : (
                      <span className="text-red-600 font-medium">Not Available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && (
          <div className="text-center py-12">
            <FaSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No parking spots found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
