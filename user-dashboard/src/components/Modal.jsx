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
    screen: 'max-w-none',
  };

  const isScreen = size === 'screen';
  const frameClass = isScreen
    ? 'h-screen w-screen rounded-none border-0'
    : 'w-full rounded-[30px] border border-slate-200';
  const panelPaddingClass = isScreen ? 'px-0 py-0' : 'px-6 py-5';
  const containerPaddingClass = isScreen ? 'px-0 py-0' : 'px-4 py-8';
  const containerAlignClass = isScreen ? 'items-center justify-center' : 'items-center justify-center';
  const backdropClass = isScreen ? 'absolute inset-0 bg-black/20 backdrop-blur-md' : 'absolute inset-0 bg-slate-900/70 backdrop-blur-3xl';

  return (
    <div className={`fixed inset-0 z-50 ${isScreen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      <div className={`flex min-h-screen ${containerAlignClass} ${containerPaddingClass} text-center`}>
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className={backdropClass}
            onClick={onClose}
          />
        </div>

        <div
          className={`relative inline-block transform overflow-hidden text-left transition-all ${sizes[size]} ${frameClass} ${
            isScreen ? 'bg-transparent shadow-none' : 'bg-white shadow-[0_24px_70px_rgba(15,23,42,0.25)]'
          }`}
        >
          {!isScreen ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.92),_transparent_26%)]" />
            </>
          ) : null}
          {title && (
            <div className={`flex items-center justify-between border-b border-slate-200 ${panelPaddingClass}`}>
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

          <div className={panelPaddingClass}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
