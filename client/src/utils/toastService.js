import { toast } from 'react-toastify';

const baseOptions = {
  position: 'top-right',
};

export const showSuccess = (msg, options = {}) =>
  toast.success(msg, { ...baseOptions, ...options });

export const showError = (msg, options = {}) =>
  toast.error(msg, { ...baseOptions, ...options });

export const showWarning = (msg, options = {}) =>
  toast.warning(msg, { ...baseOptions, ...options });

export const showInfo = (msg, options = {}) =>
  toast.info(msg, { ...baseOptions, ...options });
