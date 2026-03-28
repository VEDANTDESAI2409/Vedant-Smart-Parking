const STORAGE_KEY = 'adminPreferences';
const EVENT_NAME = 'admin-preferences-updated';

export const defaultAdminPreferences = {
  systemName: 'Smart Parking System',
  defaultPricePerHour: 5,
  maxBookingHours: 24,
  maintenanceMode: false,
  emailNotifications: true,
  smsNotifications: false,
  compactMode: false,
  reducedMotion: false,
  stickyTableHeader: true,
  confirmBulkDelete: true,
  toastDuration: 3000,
  hideToastProgress: false,
};

export const getAdminPreferences = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAdminPreferences;

    return {
      ...defaultAdminPreferences,
      ...JSON.parse(raw),
    };
  } catch (error) {
    console.error('Failed to read admin preferences:', error);
    return defaultAdminPreferences;
  }
};

export const saveAdminPreferences = (nextPreferences) => {
  const merged = {
    ...defaultAdminPreferences,
    ...nextPreferences,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: merged }));
  return merged;
};

export const subscribeToAdminPreferences = (callback) => {
  const handler = (event) => callback(event.detail || getAdminPreferences());
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};

export const adminPreferencesEventName = EVENT_NAME;

export const shouldConfirmBulkDelete = () => getAdminPreferences().confirmBulkDelete;
