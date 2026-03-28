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
        className={`fixed inset-y-0 left-0 z-40 flex w-[258px] max-w-[82vw] transform flex-col border-r border-sky-100/90 bg-[linear-gradient(180deg,rgba(248,252,255,0.98)_0%,rgba(239,249,255,0.97)_38%,rgba(240,253,250,0.98)_100%)] text-slate-900 shadow-[0_24px_56px_rgba(148,163,184,0.18)] transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 dark:border-white/20 dark:bg-[linear-gradient(180deg,rgba(7,18,33,0.98)_0%,rgba(7,22,38,0.95)_46%,rgba(6,28,41,0.98)_100%)] dark:text-white dark:shadow-[0_24px_56px_rgba(2,12,27,0.42)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(45,212,191,0.16),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.20),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_30%)]" />
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:28px_28px] dark:opacity-30 dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]" />

        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-sky-600 dark:text-teal-200/90">ParkNGo</p>
            <h1 className="mt-1.5 text-[1.8rem] font-black tracking-tight text-slate-900 dark:text-white">Admin Suite</h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300/80">Operations, analytics, and control</p>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-3.5 py-4">
          <div className="mb-4 rounded-[1.75rem] border border-sky-100 bg-white/80 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_30px_rgba(148,163,184,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300/70">Navigation</p>
            <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300/85">
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
                  <div key={item.label} className="rounded-[1.5rem] border border-sky-100 bg-white/60 p-1.5 dark:border-white/6 dark:bg-white/[0.03]">
                    <button
                      type="button"
                      onClick={() => setIsServiceLocationOpen((prev) => !prev)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                        isSubmenuActive
                          ? 'bg-sky-100 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:bg-white/12 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                          : 'text-slate-600 hover:bg-white/85 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white'
                      }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              isSubmenuActive ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-slate-200'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold">{item.label}</div>
                            <div className="truncate text-xs text-slate-500 dark:text-slate-400">{item.hint}</div>
                          </div>
                        </div>
                      {isServiceLocationOpen ? <FaChevronDown className="h-4 w-4" /> : <FaChevronRight className="h-4 w-4" />}
                    </button>

                    {isServiceLocationOpen && (
                      <div className="mt-2 space-y-1 pl-[52px] pr-2">
                        {item.submenu.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;

                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={toggleSidebar}
                              className={`block rounded-xl px-3 py-2 text-[13px] transition ${
                                isSubActive
                                  ? 'bg-teal-50 font-semibold text-teal-700 dark:bg-teal-400/12 dark:text-teal-100'
                                  : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/6 dark:hover:text-white'
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
                  className={`group flex items-center gap-3 rounded-[1.5rem] border p-1.5 transition ${
                    isActive
                      ? 'border-sky-100 bg-white/88 shadow-[0_14px_28px_rgba(148,163,184,0.14)] dark:border-white/14 dark:bg-white/10 dark:shadow-[0_14px_28px_rgba(15,23,42,0.22)]'
                      : 'border-transparent hover:border-sky-100 hover:bg-white/78 dark:hover:border-white/8 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                      isActive
                        ? 'bg-gradient-to-br from-amber-100 via-sky-50 to-teal-100 text-amber-700 dark:from-amber-300/30 dark:via-amber-200/10 dark:to-teal-300/20 dark:text-amber-100'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-slate-900 dark:bg-white/8 dark:text-slate-200 dark:group-hover:bg-white/12 dark:group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className={`truncate text-[13px] font-semibold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                      {item.label}
                    </div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">{item.hint}</div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="relative border-t border-white/10 p-3.5">
          <div className="rounded-[1.6rem] border border-sky-100 bg-white/82 px-4 py-3.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-300/75">System status</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-900 dark:text-white">Admin control active</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">All modules available</p>
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
