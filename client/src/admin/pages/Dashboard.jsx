import React, { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCar,
  FaChartLine,
  FaClock,
  FaCreditCard,
  FaFileDownload,
  FaParking,
  FaStar,
  FaUsers,
} from 'react-icons/fa';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { reportsAPI } from '../../services/api';

const fallbackStats = {
  totalSlots: 0,
  occupiedSlots: 0,
  pendingSlots: 0,
  mostUsedSlotType: 'N/A',
  mostBookedVehicleType: 'N/A',
  activeBookings: 0,
  totalUsers: 0,
  totalRevenue: 0,
  monthlyRevenue: [],
  occupancyData: [],
  bookingStatusData: [],
};

const chartPalette = ['#14b8a6', '#f59e0b', '#0f172a', '#38bdf8', '#ef4444'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reportsAPI.getDashboardStats();
      setStats(response.data?.data || null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const safeStats = stats || fallbackStats;
  const occupancyRate = safeStats.totalSlots
    ? Math.round((safeStats.occupiedSlots / safeStats.totalSlots) * 100)
    : 0;

  const summaryCards = useMemo(
    () => [
      {
        title: 'Total Parking Slots',
        value: safeStats.totalSlots,
        note: `${safeStats.occupiedSlots || 0} occupied right now`,
        icon: FaParking,
        accent: 'from-sky-100 to-blue-50',
        iconColor: 'text-sky-600 dark:text-sky-300',
      },
      {
        title: 'Occupancy Rate',
        value: `${occupancyRate}%`,
        note: `${safeStats.occupiedSlots}/${safeStats.totalSlots || 0} active spaces`,
        icon: FaChartLine,
        accent: 'from-emerald-100 to-teal-50',
        iconColor: 'text-emerald-600 dark:text-emerald-300',
      },
      {
        title: 'Pending Slots',
        value: safeStats.pendingSlots ?? 0,
        note: 'Awaiting assignment or review',
        icon: FaClock,
        accent: 'from-amber-100 to-orange-50',
        iconColor: 'text-amber-600 dark:text-amber-300',
      },
      {
        title: 'Popular Slot Type',
        value: safeStats.mostUsedSlotType,
        note: 'Most booked parking category',
        icon: FaStar,
        accent: 'from-fuchsia-100 to-rose-50',
        iconColor: 'text-fuchsia-600 dark:text-fuchsia-300',
      },
      {
        title: 'Top Vehicle Type',
        value: safeStats.mostBookedVehicleType,
        note: 'Most frequent booking segment',
        icon: FaCar,
        accent: 'from-orange-100 to-amber-50',
        iconColor: 'text-orange-600 dark:text-orange-300',
      },
      {
        title: 'Active Bookings',
        value: safeStats.activeBookings,
        note: 'Live reservations in progress',
        icon: FaCalendarAlt,
        accent: 'from-violet-100 to-indigo-50',
        iconColor: 'text-violet-600 dark:text-violet-300',
      },
      {
        title: 'Total Users',
        value: safeStats.totalUsers,
        note: 'Registered platform users',
        icon: FaUsers,
        accent: 'from-cyan-100 to-sky-50',
        iconColor: 'text-cyan-600 dark:text-cyan-300',
      },
      {
        title: 'Total Revenue',
        value: `$${Number(safeStats.totalRevenue || 0).toLocaleString()}`,
        note: 'Lifetime processed revenue',
        icon: FaCreditCard,
        accent: 'from-rose-100 to-red-50',
        iconColor: 'text-rose-600 dark:text-rose-300',
      },
    ],
    [occupancyRate, safeStats]
  );

  const downloadCSVReport = () => {
    if (!stats) return;

    const reportData = [
      ['Metric', 'Value'],
      ['Total Slots', safeStats.totalSlots],
      ['Occupied Slots', safeStats.occupiedSlots],
      ['Pending Slots', safeStats.pendingSlots],
      ['Most Used Slot Type', safeStats.mostUsedSlotType],
      ['Top Vehicle Type', safeStats.mostBookedVehicleType],
      ['Total Revenue', safeStats.totalRevenue],
    ];

    const csvContent = `data:text/csv;charset=utf-8,${reportData.map((row) => row.join(',')).join('\n')}`;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'Dashboard_Report.csv');
    document.body.appendChild(link);
    link.click();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-slate-200 border-t-teal-500 dark:border-slate-700 dark:border-t-teal-300" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] border border-sky-100 bg-[linear-gradient(135deg,#f9fdff_0%,#eefaf7_42%,#fef7e8_100%)] px-5 py-5 text-slate-900 shadow-[0_20px_52px_rgba(148,163,184,0.14)] sm:px-6 lg:px-7 dark:border-slate-200/80 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.98)_0%,rgba(14,37,62,0.95)_35%,rgba(13,87,98,0.88)_100%)] dark:text-white dark:shadow-[0_20px_52px_rgba(15,23,42,0.16)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(45,212,191,0.16),_transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.35),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(45,212,191,0.26),_transparent_30%)]" />
        <div className="absolute right-6 top-6 hidden h-36 w-36 rounded-full border border-white/60 bg-white/50 blur-3xl lg:block dark:border-white/10 dark:bg-white/5" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-600 dark:text-teal-200/85">Control Center</p>
            <h1 className="mt-2 text-[2rem] font-black tracking-tight sm:text-[2.4rem] lg:text-[3.05rem] lg:leading-[1.04]">
              Run the platform from a sharper, more executive dashboard.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 lg:max-w-[780px] dark:text-slate-200/85">
              Monitor occupancy, revenue, booking flow, and service performance from a more polished command layer
              without changing any of your existing logic.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center lg:shrink-0">
            <div className="rounded-xl border border-sky-100 bg-white/85 px-4 py-3 text-sm text-slate-600 shadow-[0_10px_20px_rgba(148,163,184,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8 dark:text-slate-100/90">
              Last updated: {new Date().toLocaleString()}
            </div>
            <Button
              onClick={downloadCSVReport}
              size="sm"
              className="rounded-xl border border-sky-200 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 px-5 text-white shadow-[0_14px_28px_rgba(14,165,233,0.18)] hover:brightness-105 dark:bg-white dark:text-slate-900"
            >
              <FaFileDownload className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 shadow-[0_10px_24px_rgba(148,163,184,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300/70">Revenue</p>
            <p className="mt-2 text-[2rem] font-black leading-none">${Number(safeStats.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 shadow-[0_10px_24px_rgba(148,163,184,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300/70">Occupancy</p>
            <p className="mt-2 text-[2rem] font-black leading-none">{occupancyRate}%</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white/75 px-4 py-3 shadow-[0_10px_24px_rgba(148,163,184,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300/70">Active Bookings</p>
            <p className="mt-2 text-[2rem] font-black leading-none">{safeStats.activeBookings}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            className="overflow-hidden"
            bodyClassName={`bg-gradient-to-br ${card.accent} px-5 py-4`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <p className="mt-2.5 text-[1.75rem] font-black tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </p>
                <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">{card.note}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-slate-950/40">
                <card.icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card
          title="Monthly Revenue"
          subtitle="Track how revenue is moving across reporting periods."
        >
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={safeStats.monthlyRevenue}>
              <defs>
                <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" />
              <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 18,
                  border: '1px solid rgba(148,163,184,0.24)',
                  background: 'rgba(15,23,42,0.96)',
                  color: '#fff',
                }}
                formatter={(value) => [`$${value}`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 0, fill: '#14b8a6' }}
                activeDot={{ r: 6 }}
                fill="url(#dashboardRevenue)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card
          title="Booking Status Distribution"
          subtitle="See how booking outcomes are split across the platform."
        >
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={safeStats.bookingStatusData}
                cx="50%"
                cy="50%"
                innerRadius={64}
                outerRadius={108}
                paddingAngle={4}
                dataKey="value"
              >
                {safeStats.bookingStatusData.map((entry, index) => (
                  <Cell key={`cell-${entry.name || index}`} fill={entry.color || chartPalette[index % chartPalette.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 18,
                  border: '1px solid rgba(148,163,184,0.24)',
                  background: 'rgba(15,23,42,0.96)',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {safeStats.bookingStatusData.map((item, index) => (
              <div
                key={`${item.name || 'status'}-${index}`}
                className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color || chartPalette[index % chartPalette.length] }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card
          title="Daily Occupancy Trend"
          subtitle="Watch how space usage changes throughout the day."
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={safeStats.occupancyData} barGap={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 18,
                  border: '1px solid rgba(148,163,184,0.24)',
                  background: 'rgba(15,23,42,0.96)',
                  color: '#fff',
                }}
              />
              <Bar dataKey="occupied" fill="#0f766e" radius={[14, 14, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Operational Notes" subtitle="A quick executive read on current platform posture.">
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/85 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Capacity signal
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {occupancyRate >= 75 ? 'High utilization' : occupancyRate >= 40 ? 'Healthy utilization' : 'Capacity available'}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Occupancy is currently at {occupancyRate}% across the monitored parking inventory.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/85 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Demand signal
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{safeStats.mostBookedVehicleType || 'N/A'}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                This vehicle segment is driving the most booking activity right now.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/85 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Revenue signal
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                ${Number(safeStats.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Total revenue remains visible at a glance so operators can make faster pricing decisions.
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
