import React from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8 text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-[rgba(241,245,249,0.78)] backdrop-blur-sm"
            onClick={onClose}
          />
        </div>

        <div
          className={`relative inline-block w-full transform overflow-hidden rounded-[30px] border border-slate-200 bg-white text-left shadow-[0_24px_70px_rgba(15,23,42,0.14)] transition-all ${sizes[size]}`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_transparent_26%)]" />
          {title && (
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">{title}</h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="px-6 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
