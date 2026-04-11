import React, { useState } from 'react';
import { FaUser, FaCar, FaCreditCard, FaBell, FaSave } from 'react-icons/fa';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
  });

  const [vehicles] = useState([
    { id: 1, make: 'Toyota', model: 'Camry', year: '2020', licensePlate: 'GJ05AB1234', color: 'Blue', vehicleType: 'car' },
    { id: 2, make: 'Honda', model: 'Civic', year: '2019', licensePlate: 'MH12CD3456', color: 'Red', vehicleType: 'car' },
  ]);

  const formatIndianPlate = (plate) => {
    if (!plate) return '';
    return plate.toUpperCase().replace(/\s/g, '');
  };

  const [paymentMethods] = useState([
    { id: 1, type: 'Credit Card', last4: '1234', brand: 'Visa', expiry: '12/25' },
    { id: 2, type: 'PayPal', email: 'john.doe@example.com' },
  ]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Handle profile update
    console.log('Profile updated:', profile);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FaUser className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">My Profile</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <FaSave className="inline mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vehicles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Vehicles</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Add Vehicle
                </button>
              </div>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex items-center justify-between gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-16 w-12 flex-col items-center justify-center rounded-l-3xl bg-blue-600 text-[9px] font-black uppercase tracking-[0.3em] text-white">
                        <span>I</span>
                        <span>N</span>
                        <span>D</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">
                          License Plate
                        </p>
                        <div className="mt-1 max-w-full overflow-x-auto text-slate-900 dark:text-white">
                          <p className="font-mono text-base font-black tracking-[0.18em] whitespace-pre text-slate-900 dark:text-white">
                            {formatIndianPlate(vehicle.licensePlate)}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      {vehicle.vehicleType || 'Car'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Add Payment
                </button>
              </div>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex items-center">
                      <FaCreditCard className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {method.type} {method.last4 && `•••• ${method.last4}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {method.expiry || method.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaBell className="text-gray-400 mr-3" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaBell className="text-gray-400 mr-3" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">SMS Notifications</span>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;