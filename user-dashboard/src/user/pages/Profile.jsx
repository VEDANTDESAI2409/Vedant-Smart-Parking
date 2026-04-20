import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  Car,
  ChevronRight,
  CreditCard,
  Loader2,
  LogOut,
  MapPinned,
  Save,
  ShieldCheck,
  User,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toastService';

const inputClass =
  'w-full rounded-[16px] border border-slate-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-sky-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(14,165,233,0.18)]';

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const Profile = () => {
  const { user, isAuthenticated, loading, updateUserData, refreshProfile, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
  });

  const [paymentMethods] = useState([
    { id: 1, type: 'Credit Card', last4: '1234', brand: 'Visa', expiry: '12/25' },
    { id: 2, type: 'PayPal', email: 'john.doe@example.com' },
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!isAuthenticated) {
        setProfileLoading(false);
        return;
      }

      try {
        const profileUser = await refreshProfile();

        if (!cancelled && profileUser) {
          setProfile({
            name: profileUser.name || '',
            email: profileUser.email || '',
            phone: profileUser.phone || '',
            address: profileUser.address || '',
          });
        }
      } catch (error) {
        if (!cancelled) {
          showError(error?.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshProfile]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfile((current) => ({
      ...current,
      name: user.name || current.name,
      email: user.email || current.email,
      phone: user.phone || current.phone,
      address: user.address || current.address,
    }));
  }, [user]);

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileUpdate = async (event) => {
    event.preventDefault();

    try {
      const targetUserId = user?.id || user?._id;
      const response = await usersAPI.updateProfile(targetUserId, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });

      updateUserData(response.data.data.user);
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleAddVehicle = () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.year || !newVehicle.licensePlate || !newVehicle.color) {
      showError('Please fill all vehicle details');
      return;
    }

    const vehicle = { ...newVehicle, id: Date.now() };
    setVehicles([...vehicles, vehicle]);
    setNewVehicle({ make: '', model: '', year: '', licensePlate: '', color: '' });
    setShowAddVehicleForm(false);
    showSuccess('Vehicle added successfully');
  };

  const handleLogout = () => {
    logout();
  };

  const profileInitial = (profile.name || user?.name || 'P').trim().charAt(0).toUpperCase();
  const accountName = profile.name || user?.name || 'Your profile';
  const accountEmail = profile.email || user?.email || 'Add email';
  const accountPhone = profile.phone || user?.phone || 'Add phone';

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_48%,#ffffff_100%)] text-[var(--color-secondary)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.55),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%)]" />

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="reveal-up overflow-hidden rounded-[32px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_70px_rgba(17,31,26,0.08)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(145deg,var(--color-primary)_0%,var(--color-tertiary)_100%)] text-2xl font-bold text-white shadow-[0_18px_36px_rgba(14,165,233,0.2)]">
                {profileInitial}
              </div>
              <div>
                <p className="section-kicker">My account</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-secondary)] sm:text-4xl">
                  Profile Settings
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Keep your account ready for faster bookings, verified contact details, and smoother parking sessions.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
              {[
                ['Status', 'Verified', BadgeCheck],
                ['Vehicles', `${vehicles.length} saved`, Car],
                ['Security', 'Protected', ShieldCheck],
              ].map(([label, value, Icon]) => (
                <div
                  key={label}
                  className="rounded-[24px] border border-[rgba(14,165,233,0.14)] bg-white p-4 shadow-[0_12px_34px_rgba(17,31,26,0.05)]"
                >
                  <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <aside className="space-y-6">
            <section className="reveal-up reveal-delay-1 rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_50px_rgba(17,31,26,0.06)] backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[rgba(14,165,233,0.12)] text-[var(--color-primary)]">
                  <User className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-slate-900">{accountName}</h2>
                  <p className="mt-1 truncate text-sm text-slate-500">{accountEmail}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  [MapPinned, accountPhone],
                  [Bell, 'Booking alerts enabled'],
                  [WalletCards, `${paymentMethods.length} payment options`],
                ].map(([Icon, label]) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-[20px] bg-[var(--color-muted-surface)] px-4 py-3 text-sm text-slate-600"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-between rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0369a1]"
                >
                  Book Parking
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </section>

            <section className="reveal-up reveal-delay-2 rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_50px_rgba(17,31,26,0.06)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Payments</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">Payment Methods</h3>
                </div>
                <CreditCard className="h-5 w-5 text-[var(--color-primary)]" />
              </div>

              <div className="mt-4 space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center gap-3 rounded-[22px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-white text-[var(--color-primary)]">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {method.type} {method.last4 ? `.... ${method.last4}` : ''}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">{method.expiry || method.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="reveal-up reveal-delay-1 rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_50px_rgba(17,31,26,0.06)] backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Account details</p>
                  <h2 className="mt-1 text-2xl font-semibold text-[var(--color-secondary)]">Personal Information</h2>
                </div>
                {profileLoading ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading
                  </div>
                ) : null}
              </div>

              <form onSubmit={handleProfileUpdate} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Full name">
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                      className={inputClass}
                      placeholder="Your full name"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </Field>

                  <Field label="Phone">
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
                      className={inputClass}
                      placeholder="+91 98765 43210"
                    />
                  </Field>

                  <Field label="Address">
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(event) => setProfile({ ...profile, address: event.target.value })}
                      className={inputClass}
                      placeholder="Home or billing address"
                    />
                  </Field>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(14,165,233,0.2)] transition hover:bg-[#0369a1] disabled:opacity-70"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </section>

            <section className="reveal-up reveal-delay-2 rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_50px_rgba(17,31,26,0.06)] backdrop-blur-xl sm:p-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Garage</p>
                  <h3 className="mt-1 text-2xl font-semibold text-[var(--color-secondary)]">My Vehicles</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}
                  className="inline-flex items-center justify-center rounded-full border border-[rgba(14,165,233,0.16)] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  {showAddVehicleForm ? 'Cancel' : 'Add Vehicle'}
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {vehicles.length ? (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center gap-3 rounded-[24px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white text-[var(--color-primary)]">
                        <Car className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {vehicle.licensePlate} - {vehicle.color}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-sky-200 bg-sky-50/60 px-5 py-6 text-center">
                    <Car className="mx-auto h-8 w-8 text-[var(--color-primary)]" />
                    <p className="mt-3 text-sm font-semibold text-slate-900">No saved vehicles yet</p>
                    <p className="mt-1 text-sm text-slate-500">Add one now to speed up future bookings.</p>
                  </div>
                )}
              </div>

              {showAddVehicleForm && (
                <div className="mt-5 rounded-[24px] border border-[rgba(14,165,233,0.12)] bg-[var(--color-muted-surface)] p-4 sm:p-5">
                  <h4 className="text-base font-semibold text-slate-900">Add New Vehicle</h4>
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Field label="Vehicle type">
                      <select
                        value={newVehicle.make}
                        onChange={(event) => setNewVehicle({ ...newVehicle, make: event.target.value })}
                        className={inputClass}
                      >
                        <option value="">Select Type</option>
                        <option value="Car">Car</option>
                        <option value="Bike">Bike</option>
                      </select>
                    </Field>
                    <Field label="Model">
                      <input
                        type="text"
                        placeholder="Model"
                        value={newVehicle.model}
                        onChange={(event) => setNewVehicle({ ...newVehicle, model: event.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Year">
                      <input
                        type="text"
                        placeholder="Year"
                        value={newVehicle.year}
                        onChange={(event) => setNewVehicle({ ...newVehicle, year: event.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="License plate">
                      <input
                        type="text"
                        placeholder="GJ05AB1234"
                        value={newVehicle.licensePlate}
                        onChange={(event) => setNewVehicle({ ...newVehicle, licensePlate: event.target.value })}
                        className={`${inputClass} font-mono uppercase`}
                      />
                    </Field>
                    <Field label="Color">
                      <input
                        type="text"
                        placeholder="Color"
                        value={newVehicle.color}
                        onChange={(event) => setNewVehicle({ ...newVehicle, color: event.target.value })}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="mt-4 flex flex-col justify-end gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setShowAddVehicleForm(false)}
                      className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVehicle}
                      className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0369a1]"
                    >
                      Add Vehicle
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
