import React from 'react';

/**
 * DataTable Component
 * High-density reusable data table conforming to FINDIT institutional SaaS specifications
 */
export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  pagination = null,
  onPageChange = null,
  emptyMessage = 'No records found matching current query or filters.',
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-[#DCE4F0] p-12 text-center shadow-xs ${className}`}>
        <div className="inline-block w-8 h-8 border-3 border-[#003EC3]/20 border-t-[#003EC3] rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-[#434655] font-medium tracking-wide">Loading real-time records...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-[#DCE4F0] shadow-xs overflow-hidden flex flex-col ${className}`}>
      <div className="overflow-x-auto admin-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EFF4FF] text-[#434655] text-xs font-semibold uppercase tracking-wider border-b border-[#DCE4F0]">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  scope="col"
                  className={`py-3.5 px-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.headerClassName || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFF4FF] text-sm text-[#0B1C30]">
            {data && data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  className="hover:bg-[#EFF4FF]/60 transition-colors group"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key || colIdx}
                      className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center text-[#434655] text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-8 h-8 text-[#CBDBF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.pages > 1 && (
        <div className="px-4 py-3 bg-[#EFF4FF]/50 border-t border-[#DCE4F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#434655]">
          <div>
            Showing page <span className="font-bold text-[#0B1C30]">{pagination.page}</span> of{' '}
            <span className="font-bold text-[#0B1C30]">{pagination.pages}</span> (
            <span className="font-mono">{pagination.total}</span> total entries)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#DCE4F0] bg-white font-medium hover:bg-[#EFF4FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-bold text-[#003EC3] bg-white border border-[#DCE4F0] rounded-lg">
              {pagination.page}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1.5 rounded-lg border border-[#DCE4F0] bg-white font-medium hover:bg-[#EFF4FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
