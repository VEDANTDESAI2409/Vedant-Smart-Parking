import React, { useMemo, useState } from 'react';
import {
  FaBell,
  FaCheckCircle,
  FaDesktop,
  FaSave,
  FaShieldAlt,
  FaSlidersH,
} from 'react-icons/fa';
import Button from '../../components/Button';
import Card from '../../components/Card';
import {
  defaultAdminPreferences,
  getAdminPreferences,
  saveAdminPreferences,
} from '../../utils/adminPreferences';
import { showInfo, showSuccess } from '../../utils/toastService';

const inputClassName =
  'mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const ToggleRow = ({ title, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 rounded-3xl border border-slate-200/80 bg-slate-50/85 p-4 dark:border-slate-800 dark:bg-slate-950/40">
    <div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const Settings = () => {
  const [settings, setSettings] = useState(getAdminPreferences());
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    const normalized = {
      ...settings,
      defaultPricePerHour: Number(settings.defaultPricePerHour) || 0,
      maxBookingHours: Number(settings.maxBookingHours) || 1,
      toastDuration: Number(settings.toastDuration) || 3000,
    };

    saveAdminPreferences(normalized);
    setSettings(normalized);
    setSaving(false);
    showSuccess('Admin settings saved successfully');
  };

  const quickActions = useMemo(
    () => [
      {
        label: 'Enable compact mode',
        action: () => {
          const next = saveAdminPreferences({ ...settings, compactMode: true });
          setSettings(next);
          showInfo('Compact mode enabled');
        },
      },
      {
        label: 'Turn off bulk delete confirmation',
        action: () => {
          const next = saveAdminPreferences({ ...settings, confirmBulkDelete: false });
          setSettings(next);
          showInfo('Bulk delete confirmation disabled');
        },
      },
      {
        label: 'Reset to defaults',
        action: () => {
          const next = saveAdminPreferences(defaultAdminPreferences);
          setSettings(next);
          showSuccess('Settings reset');
        },
      },
    ],
    [settings]
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-700 dark:text-teal-300">
            Admin Preferences
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Make the dashboard easier to handle.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            These settings are focused on admin convenience. They do not change your existing business logic or backend behavior.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickActions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card
            title="Operational Defaults"
            subtitle="Quick values and labels that help admins work faster."
            headerClassName="flex items-center gap-3"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  System Name
                </label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => handleChange('systemName', e.target.value)}
                  className={inputClassName}
                  placeholder="Smart Parking System"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Default Price per Hour
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.defaultPricePerHour}
                  onChange={(e) => handleChange('defaultPricePerHour', e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Booking Hours
                </label>
                <input
                  type="number"
                  value={settings.maxBookingHours}
                  onChange={(e) => handleChange('maxBookingHours', e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </Card>

          <Card title="Quick Admin Status" subtitle="A fast overview of the preferences affecting your workspace.">
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/85 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
                    <FaDesktop />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Workspace density</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {settings.compactMode ? 'Compact mode is active' : 'Comfortable spacing is active'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/85 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
                    <FaShieldAlt />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Bulk delete safety</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {settings.confirmBulkDelete ? 'Confirmation is enabled' : 'Confirmation is disabled'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/85 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300">
                    <FaBell />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Toast handling</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Auto close after {(Number(settings.toastDuration) || 3000) / 1000}s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card title="Workspace Preferences" subtitle="Controls that make daily admin work smoother.">
            <div className="space-y-4">
              <ToggleRow
                title="Compact mode"
                description="Reduce vertical spacing in tables and page sections to see more data at once."
                checked={settings.compactMode}
                onChange={() => handleChange('compactMode', !settings.compactMode)}
              />
              <ToggleRow
                title="Sticky table headers"
                description="Keep table headers visible while scrolling large datasets."
                checked={settings.stickyTableHeader}
                onChange={() => handleChange('stickyTableHeader', !settings.stickyTableHeader)}
              />
              <ToggleRow
                title="Reduced motion"
                description="Use calmer movement and transitions for a more focused workspace."
                checked={settings.reducedMotion}
                onChange={() => handleChange('reducedMotion', !settings.reducedMotion)}
              />
              <ToggleRow
                title="Bulk delete confirmation"
                description="Ask before deleting multiple selected records at once."
                checked={settings.confirmBulkDelete}
                onChange={() => handleChange('confirmBulkDelete', !settings.confirmBulkDelete)}
              />
            </div>
          </Card>

          <Card title="Notifications and Alerts" subtitle="Tune feedback so admin actions feel clearer and less noisy.">
            <div className="space-y-4">
              <ToggleRow
                title="Email notifications"
                description="Keep this enabled if admins should be reminded about key system updates."
                checked={settings.emailNotifications}
                onChange={() => handleChange('emailNotifications', !settings.emailNotifications)}
              />
              <ToggleRow
                title="SMS notifications"
                description="Enable only if you want urgent admin alerts to stand out more strongly."
                checked={settings.smsNotifications}
                onChange={() => handleChange('smsNotifications', !settings.smsNotifications)}
              />
              <ToggleRow
                title="Hide toast progress bar"
                description="Useful when you want a cleaner toast style with less visual noise."
                checked={settings.hideToastProgress}
                onChange={() => handleChange('hideToastProgress', !settings.hideToastProgress)}
              />

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/85 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Toast Auto Close Duration
                </label>
                <select
                  value={settings.toastDuration}
                  onChange={(e) => handleChange('toastDuration', Number(e.target.value))}
                  className={inputClassName}
                >
                  <option value={2000}>2 seconds</option>
                  <option value={3000}>3 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={8000}>8 seconds</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card title="System Controls" subtitle="Keep a few high-level admin switches in one place.">
            <div className="space-y-4">
              <ToggleRow
                title="Maintenance mode"
                description="Use this as an admin-only reminder flag when the system is under maintenance planning."
                checked={settings.maintenanceMode}
                onChange={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
              />
            </div>
          </Card>

          <Card title="Admin Tips" subtitle="Small additions that make the dashboard easier to manage.">
            <div className="space-y-3">
              {[
                'Use compact mode when reviewing long city, location, and slot lists.',
                'Keep sticky headers on if you regularly work with bulk selections.',
                'Leave bulk delete confirmation enabled unless you are cleaning up test data often.',
                'Shorter toast durations help when you perform repetitive CRUD work.',
              ].map((tip) => (
                <div
                  key={tip}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/85 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <FaCheckCircle className="mt-1 h-4 w-4 shrink-0 text-teal-500" />
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const current = getAdminPreferences();
              setSettings(current);
              showInfo('Reloaded saved settings');
            }}
          >
            <FaSlidersH className="mr-2" />
            Reload Saved
          </Button>
          <Button type="submit" disabled={saving}>
            <FaSave className="mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
