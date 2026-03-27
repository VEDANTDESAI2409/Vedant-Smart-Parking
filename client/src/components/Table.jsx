import React from 'react';
import { getAdminPreferences, subscribeToAdminPreferences } from '../utils/adminPreferences';

const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  selectable = false,
  selectedRowIds = [],
  onRowSelect,
  onSelectAll,
  getRowId = (row) => row?._id || row?.id,
}) => {
  const [adminPreferences, setAdminPreferences] = React.useState(getAdminPreferences());

  React.useEffect(() => subscribeToAdminPreferences(setAdminPreferences), []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-teal-500 dark:border-slate-700 dark:border-t-teal-400" />
      </div>
    );
  }

  const selectedSet = new Set(selectedRowIds);
  const selectableRows = data.filter((row) => getRowId(row));
  const allSelected = selectableRows.length > 0 && selectableRows.every((row) => selectedSet.has(getRowId(row)));
  const rowPaddingClass = adminPreferences.compactMode ? 'py-2' : 'py-2.5';
  const headerPaddingClass = adminPreferences.compactMode ? 'py-2.5' : 'py-3';

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 ${className}`}>
      <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead
          className={`bg-slate-50/95 dark:bg-slate-900 ${
            adminPreferences.stickyTableHeader ? 'sticky top-0 z-10' : ''
          }`}
        >
          <tr>
            {selectable && (
              <th className={`w-12 px-3 text-center ${headerPaddingClass}`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onSelectAll?.(event.target.checked)}
                  aria-label="Select all rows"
                  className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 ${headerPaddingClass}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/70"
              >
                {selectable && (
                  <td className={`px-3 text-center align-top ${rowPaddingClass}`}>
                    <input
                      type="checkbox"
                      checked={selectedSet.has(getRowId(row))}
                      onChange={(event) => onRowSelect?.(getRowId(row), event.target.checked)}
                      aria-label="Select row"
                      disabled={!getRowId(row)}
                      className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </td>
                )}
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 align-top text-sm text-slate-700 dark:text-slate-200 ${rowPaddingClass}`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Table;
