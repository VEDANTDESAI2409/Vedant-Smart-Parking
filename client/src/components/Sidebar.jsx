import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaCar,
  FaChartBar,
  FaChevronDown,
  FaChevronRight,
  FaCog,
  FaCreditCard,
  FaMapMarkerAlt,
  FaParking,
  FaTachometerAlt,
  FaUser,
  FaUsers,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const serviceLocationPaths = ['/admin/city', '/admin/pincode', '/admin/area', '/admin/location'];
  const [isServiceLocationOpen, setIsServiceLocationOpen] = useState(false);

  useEffect(() => {
    if (serviceLocationPaths.includes(location.pathname)) {
      setIsServiceLocationOpen(true);
    }
  }, [location.pathname]);

  const menuItems = useMemo(
    () => [
      { path: '/admin/dashboard', label: 'Overview', icon: FaTachometerAlt, hint: 'Executive command center' },
      { path: '/admin/parking-slots', label: 'Parking Slots', icon: FaParking, hint: 'Inventory and pricing' },
      { path: '/admin/bookings', label: 'Bookings', icon: FaCalendarAlt, hint: 'Reservations and activity' },
      { path: '/admin/users', label: 'Users', icon: FaUsers, hint: 'Drivers and admins' },
      { path: '/admin/vehicles', label: 'Vehicles', icon: FaCar, hint: 'Fleet and registrations' },
      { path: '/admin/payments', label: 'Payments', icon: FaCreditCard, hint: 'Transactions and ledgers' },
      {
        label: 'Service Locations',
        icon: FaMapMarkerAlt,
        hint: 'City hierarchy management',
        submenu: [
          { path: '/admin/city', label: 'City' },
          { path: '/admin/pincode', label: 'Pincode' },
          { path: '/admin/area', label: 'Area' },
          { path: '/admin/location', label: 'Location' },
        ],
      },
      { path: '/admin/reports', label: 'Reports', icon: FaChartBar, hint: 'Analytics and exports' },
      { path: '/admin/settings', label: 'Settings', icon: FaCog, hint: 'Platform controls' },
      { path: '/admin/profile', label: 'Profile', icon: FaUser, hint: 'Account and preferences' },
    ],
    []
  );

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[300px] max-w-[86vw] transform flex-col border-r border-white/20 bg-[linear-gradient(180deg,rgba(7,18,33,0.98)_0%,rgba(7,22,38,0.95)_46%,rgba(6,28,41,0.98)_100%)] text-white shadow-[0_30px_80px_rgba(2,12,27,0.45)] transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.20),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_30%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-teal-200/90">ParkNGo</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight">Admin Suite</h1>
            <p className="mt-1 text-sm text-slate-300/80">Operations, analytics, and control</p>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-5 rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-300/70">Navigation</p>
            <p className="mt-2 text-sm leading-6 text-slate-300/85">
              Move across operations with a cleaner enterprise-style command panel.
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path ? location.pathname === item.path : false;
              const isSubmenuActive = item.submenu?.some((subItem) => location.pathname === subItem.path);

              if (item.submenu) {
                return (
                  <div key={item.label} className="rounded-3xl border border-white/6 bg-white/[0.03] p-2">
                    <button
                      type="button"
                      onClick={() => setIsServiceLocationOpen((prev) => !prev)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                        isSubmenuActive
                          ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                          : 'text-slate-300 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                            isSubmenuActive ? 'bg-amber-400/15 text-amber-200' : 'bg-white/8 text-slate-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{item.label}</div>
                          <div className="truncate text-xs text-slate-400">{item.hint}</div>
                        </div>
                      </div>
                      {isServiceLocationOpen ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
                    </button>

                    {isServiceLocationOpen && (
                      <div className="mt-2 space-y-1 pl-[62px] pr-2">
                        {item.submenu.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;

                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={toggleSidebar}
                              className={`block rounded-2xl px-4 py-2.5 text-sm transition ${
                                isSubActive
                                  ? 'bg-teal-400/12 font-semibold text-teal-100'
                                  : 'text-slate-300 hover:bg-white/6 hover:text-white'
                              }`}
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
                  onClick={toggleSidebar}
                  className={`group flex items-center gap-3 rounded-3xl border p-2 transition ${
                    isActive
                      ? 'border-white/14 bg-white/10 shadow-[0_18px_40px_rgba(15,23,42,0.28)]'
                      : 'border-transparent hover:border-white/8 hover:bg-white/[0.05]'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
                      isActive
                        ? 'bg-gradient-to-br from-amber-300/30 via-amber-200/10 to-teal-300/20 text-amber-100'
                        : 'bg-white/8 text-slate-200 group-hover:bg-white/12 group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className={`truncate text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {item.label}
                    </div>
                    <div className="truncate text-xs text-slate-400">{item.hint}</div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative border-t border-white/10 p-4">
          <div className="rounded-3xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-300/75">System status</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Admin control active</p>
                <p className="text-xs text-slate-400">All modules available</p>
              </div>
              <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.14)]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
