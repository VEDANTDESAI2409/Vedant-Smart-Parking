import React, { useEffect, useMemo, useRef, useState } from 'react';

const baseControlClasses =
  'mt-1 flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500/40 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found',
  className = '',
  menuClassName = '',
}) => {
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
  }, [options, searchTerm]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) {
      return;
    }

    setIsOpen((prev) => {
      if (prev) {
        setSearchTerm('');
      }
      return !prev;
    });
  };

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={`${baseControlClasses} ${
          disabled
            ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
            : 'bg-white text-gray-900'
        }`}
      >
        <span className={selectedOption ? '' : 'text-gray-400 dark:text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800 ${menuClassName}`}
        >
          <div className="border-b border-gray-100 p-2 dark:border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/70'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.415 0l-3-3a1 1 0 111.414-1.42l2.293 2.294 6.493-6.494a1 1 0 011.415 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
