import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-[0.02em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'border border-sky-200 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 text-white shadow-[0_14px_28px_rgba(14,165,233,0.22)] hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(6,182,212,0.24)] hover:brightness-105 focus:ring-cyan-500 dark:border-teal-300/20 dark:from-teal-500 dark:via-cyan-500 dark:to-blue-600 dark:text-slate-950 dark:shadow-[0_18px_42px_rgba(20,184,166,0.28)]',
    secondary:
      'border border-teal-200 bg-gradient-to-r from-teal-400 to-emerald-400 text-white shadow-[0_14px_28px_rgba(16,185,129,0.2)] hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(16,185,129,0.24)] hover:brightness-105 focus:ring-emerald-500',
    outline:
      'border border-slate-200/90 bg-white/92 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)] focus:ring-slate-400 dark:border-slate-700/80 dark:bg-slate-900/88 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800',
    danger:
      'border border-rose-500/20 bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_16px_30px_rgba(225,29,72,0.22)] hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(225,29,72,0.26)] hover:brightness-105 focus:ring-rose-500',
  };

  const sizes = {
    sm: 'min-h-[40px] px-3.5 py-2 text-[13px]',
    md: 'min-h-[46px] px-5 py-2.5 text-sm',
    lg: 'min-h-[52px] px-6 py-3 text-[15px]',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
