import React from 'react';
import { FaSearch } from 'react-icons/fa';

const ListSearchInput = ({ value, onChange, placeholder, className = '' }) => (
  <div className={`group relative max-w-md ${className}`}>
    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500" />
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
    />
  </div>
);

export default ListSearchInput;
