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
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={onClose}
          />
        </div>

        <div
          className={`relative inline-block w-full transform overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/94 text-left shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(10,24,39,0.96)_0%,rgba(9,20,34,0.93)_100%)] dark:shadow-[0_30px_90px_rgba(2,12,27,0.52)] ${sizes[size]}`}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/70 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.42),_transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.08),_transparent_24%)]" />
          {title && (
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-5 dark:border-slate-800">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
