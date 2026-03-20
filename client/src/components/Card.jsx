import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  ...props
}) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border border-slate-200/75 bg-white/92 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-[linear-gradient(180deg,rgba(10,24,39,0.96)_0%,rgba(9,20,34,0.90)_100%)] dark:shadow-[0_28px_80px_rgba(2,12,27,0.45)] ${className}`}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.55),_transparent_24%)] opacity-60 dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.08),_transparent_22%)] dark:opacity-100" />
      {(title || subtitle) && (
        <div className={`relative border-b border-slate-200/70 px-6 py-5 dark:border-slate-800/90 ${headerClassName}`}>
          {title && <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}
      <div className={`relative px-6 py-5 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
