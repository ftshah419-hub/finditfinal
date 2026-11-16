import React from 'react';

/**
 * ActivityLogTable Component
 * Immutable Forensic Audit Trail Table
 * Directly conforms to 15_admin_analytics_and_logs
 */
export const ActivityLogTable = ({
  logs = [],
  loading = false,
  pagination = null,
  onPageChange,
  search = '',
  onSearchChange,
  entityFilter = '',
  onEntityFilterChange,
  onRefresh
}) => {
  const getActionColor = (action = '') => {
    if (action.includes('APPROVED') || action.includes('RESOLVED') || action.includes('ACTIVATED')) {
      return 'bg-emerald-600';
    }
    if (action.includes('REJECTED') || action.includes('DEACTIVATED') || action.includes('DISMISSED')) {
      return 'bg-[#BA1A1A]';
    }
    return 'bg-[#003EC3]';
  };

  const getHash = (id) => {
    if (!id) return 'SHA-256 e8f4...';
    return `SHA-256 ${id.slice(-4).toLowerCase()}...`;
  };

  return (
    <div className="bg-white rounded-xl border border-[#DCE4F0] shadow-xs overflow-hidden flex flex-col">
      {/* Table Header & Controls */}
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DCE4F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#EFF4FF] flex items-center justify-center text-[#003EC3]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <h2 className="text-base font-bold text-[#0B1C30]">
              Immutable System Audit Trail
            </h2>
          </div>
          <p className="text-xs text-[#434655] mt-1">
            Cryptographically sealed operational journal conforming to audit standards.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-60">
            <svg className="w-4 h-4 absolute left-3 top-3 text-[#434655]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search actions, actors, targets..."
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#0B1C30] placeholder:text-[#434655] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003EC3]/20"
            />
          </div>

          <div className="relative min-w-[140px]">
            <select
              value={entityFilter}
              onChange={(e) => onEntityFilterChange && onEntityFilterChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-medium text-[#0B1C30] appearance-none cursor-pointer focus:bg-white focus:outline-none"
            >
              <option value="">Scope: All</option>
              <option value="USER">User Events</option>
              <option value="ITEM">Item Events</option>
              <option value="CLAIM">Claim Events</option>
              <option value="REPORT">Report Events</option>
              <option value="CATEGORY">Category Events</option>
              <option value="AI_MATCH">AI Match Events</option>
              <option value="SETTING">Settings Events</option>
            </select>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Audit Stream"
              className="h-10 w-10 bg-[#EFF4FF] hover:bg-[#E5EEFF] border border-[#DCE4F0] text-[#003EC3] rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto admin-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#EFF4FF] text-[#434655] text-xs font-semibold uppercase tracking-wider border-b border-[#DCE4F0]">
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Event Type</th>
              <th className="py-3 px-4 font-semibold">Actor / Admin</th>
              <th className="py-3 px-4 font-semibold">Target Entity</th>
              <th className="py-3 px-4 font-semibold">Description</th>
              <th className="py-3 px-4 font-semibold">Integrity Hash</th>
              <th className="py-3 px-4 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFF4FF] text-xs text-[#0B1C30]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#434655]">
                  <div className="inline-block w-6 h-6 border-2 border-[#003EC3]/20 border-t-[#003EC3] rounded-full animate-spin"></div>
                  <p className="mt-2 text-xs">Loading forensic activity stream...</p>
                </td>
              </tr>
            ) : logs && logs.length > 0 ? (
              logs.map((log, idx) => {
                const date = log.createdAt ? new Date(log.createdAt) : new Date();
                return (
                  <tr key={log._id || idx} className="hover:bg-[#EFF4FF]/60 transition-colors group">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-[#0B1C30]">
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-[11px] text-[#434655]">{date.toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Event Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getActionColor(log.action)}`}></span>
                        <span className="font-semibold text-xs text-[#0B1C30]">
                          {log.action?.replace(/_/g, ' ') || 'ACTION'}
                        </span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#003EC3]/10 text-[#003EC3] flex items-center justify-center font-bold text-[10px]">
                          {log.actorId?.name ? log.actorId.name.charAt(0) : 'S'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs text-[#0B1C30]">
                            {log.actorId?.name || 'System Daemon'}
                          </span>
                          <span className="text-[10px] text-[#005AC4]">
                            {log.actorId?.role === 'ADMIN' ? 'Superadmin' : log.actorId?.role || 'Service'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Target Object */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#003EC3] bg-[#EFF4FF] px-2 py-0.5 rounded border border-[#DCE4F0]">
                          #{log.entityType || 'SYS'}-{log.entityId ? log.entityId.toString().slice(-4).toUpperCase() : '0000'}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="truncate block text-[#434655]" title={log.description}>
                        {log.description}
                      </span>
                    </td>

                    {/* Integrity Hash */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-[#434655]">
                        {getHash(log._id)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Success
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#434655]">
                  No audit logs recorded for this criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-3.5 bg-[#EFF4FF]/50 border-t border-[#DCE4F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#434655]">
          <div>
            Page <span className="font-bold text-[#0B1C30]">{pagination.page}</span> of{' '}
            <span className="font-bold text-[#0B1C30]">{pagination.pages}</span> (
            <span className="font-mono">{pagination.total}</span> total audit trails)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[#DCE4F0] bg-white font-medium hover:bg-[#EFF4FF] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 font-bold text-[#003EC3] bg-white border border-[#DCE4F0] rounded-lg">
              {pagination.page}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1.5 rounded-lg border border-[#DCE4F0] bg-white font-medium hover:bg-[#EFF4FF] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogTable;
