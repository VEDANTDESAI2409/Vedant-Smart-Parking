import React, { useState } from 'react';
import { FaBell, FaCar, FaCreditCard, FaSave, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toastService';

const Profile = () => {
  const { user, updateUserData } = useContext(AuthContext);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [vehicles] = useState([
    { id: 1, make: 'Toyota', model: 'Camry', year: '2020', licensePlate: 'ABC-123', color: 'Blue' },
    { id: 2, make: 'Honda', model: 'Civic', year: '2019', licensePlate: 'XYZ-789', color: 'Red' },
  ]);

  const [paymentMethods] = useState([
    { id: 1, type: 'Credit Card', last4: '1234', brand: 'Visa', expiry: '12/25' },
    { id: 2, type: 'PayPal', email: 'john.doe@example.com' },
  ]);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    try {
      const response = await usersAPI.updateProfile(user._id, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
      
      // Update the user data in context
      updateUserData(response.data.data.user);
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      showError(error?.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_100%)] px-4 py-8 text-[var(--color-secondary)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_24px_70px_rgba(17,31,26,0.08)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">My Account</p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--color-secondary)] sm:text-4xl">Profile Settings</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Manage personal information, saved vehicles, payment methods, and notification preferences.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(14,165,233,0.12)] text-[var(--color-primary)]">
              <FaUser className="h-6 w-6" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(17,31,26,0.05)] sm:p-8">
            <h2 className="text-2xl font-semibold text-[var(--color-secondary)]">Personal Information</h2>

            <form onSubmit={handleProfileUpdate} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                    className="w-full rounded-2xl border border-[rgba(14,165,233,0.16)] bg-slate-50/80 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(14,165,233,0.18)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                    className="w-full rounded-2xl border border-[rgba(14,165,233,0.16)] bg-slate-50/80 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(14,165,233,0.18)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                    className="w-full rounded-2xl border border-[rgba(14,165,233,0.16)] bg-slate-50/80 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(14,165,233,0.18)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Address</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(event) => setProfile({ ...profile, address: event.target.value })}
                    className="w-full rounded-2xl border border-[rgba(14,165,233,0.16)] bg-slate-50/80 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(14,165,233,0.18)]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0369a1]"
                >
                  <FaSave className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <section className="rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(17,31,26,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-[var(--color-secondary)]">My Vehicles</h3>
                <button className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[#0369a1]">
                  Add Vehicle
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center gap-3 rounded-[24px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(14,165,233,0.12)] text-[var(--color-primary)]">
                      <FaCar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {vehicle.licensePlate} • {vehicle.color}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(17,31,26,0.05)]">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-[var(--color-secondary)]">Payment Methods</h3>
                <button className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[#0369a1]">
                  Add Payment
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center gap-3 rounded-[24px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(14,165,233,0.12)] text-[var(--color-primary)]">
                      <FaCreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {method.type} {method.last4 ? `•••• ${method.last4}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{method.expiry || method.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(17,31,26,0.05)]">
              <h3 className="text-xl font-semibold text-[var(--color-secondary)]">Notifications</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-[24px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(14,165,233,0.12)] text-[var(--color-primary)]">
                      <FaBell className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Email Notifications</span>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)]" />
                </div>

                <div className="flex items-center justify-between rounded-[24px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(14,165,233,0.12)] text-[var(--color-primary)]">
                      <FaBell className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">SMS Notifications</span>
                  </div>
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)]" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

