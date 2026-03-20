import React from 'react';
import Button from './Button';

const ConfirmationModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Yes, Continue',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  tone = 'danger',
}) => {
  if (!isOpen) return null;

  const toneClasses =
    tone === 'danger'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses}`}>
            Confirmation
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="button" variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Please wait...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
