import React, { useState, useRef } from 'react';
import { FaSave, FaUser, FaCamera } from 'react-icons/fa';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  // Pull user and the new update function from context
  const { user, updateUserData } = useAuth(); 
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: user?.avatar || null, 
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // 1. Logic for your API call would go here
      // await axios.put('/api/admin/profile', profile);

      // 2. Sync with Sidebar & Header
      updateUserData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar 
      });

      alert('Changes saved successfully!');
      
      // Clear password fields after success
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error(error);
      alert('Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card - Profile Preview */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <div className="relative mx-auto h-24 w-24 group">
              <div className="h-24 w-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-600">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <FaUser className="h-12 w-12 text-gray-600" />
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FaCamera className="text-white w-6 h-6" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
            
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{profile.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</p>
            <p className="text-sm text-blue-500 font-bold mt-1">Administrator</p>
          </div>
        </Card>

        {/* Right Card - Form Fields */}
        <Card className="lg:col-span-2" title="Edit Profile">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Change Password Section Restored */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                  <input
                    type="password"
                    value={profile.currentPassword}
                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input
                      type="password"
                      value={profile.newPassword}
                      onChange={(e) => handleChange('newPassword', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input
                      type="password"
                      value={profile.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                <FaSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;