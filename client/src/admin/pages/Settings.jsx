import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import Button from '../../components/Button';
import Card from '../../components/Card';

const Settings = () => {
  const [settings, setSettings] = useState({
    systemName: 'Smart Parking System',
    defaultPricePerHour: 5.00,
    maxBookingHours: 24,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="General Settings">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                System Name
              </label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => handleChange('systemName', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Price per Hour ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.defaultPricePerHour}
                onChange={(e) => handleChange('defaultPricePerHour', parseFloat(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Maximum Booking Hours
              </label>
              <input
                type="number"
                value={settings.maxBookingHours}
                onChange={(e) => handleChange('maxBookingHours', parseInt(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </Card>

        <Card title="System Settings">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="maintenanceMode"
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Maintenance Mode
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="emailNotifications"
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Email Notifications
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="smsNotifications"
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                SMS Notifications
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            <FaSave className="mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;