import React from 'react';

/**
 * DashboardStats Component
 * 6-Card High-Density Telemetry KPI Grid directly conforming to 09_admin_overview
 */
export const DashboardStats = ({ stats = {}, onNavigateTab }) => {
  const usersCount = stats?.users?.total ?? 0;
  const staffCount = stats?.users?.adminStaff ?? 0;
  const lostCount = stats?.items?.lost ?? 0;
  const foundCount = stats?.items?.found ?? 0;
  const pendingClaimsCount = stats?.claims?.pending ?? 0;
  const resolvedCount = stats?.items?.resolved ?? 0;
  const totalItems = stats?.items?.total ?? (lostCount + foundCount);
  const aiPendingCount = stats?.aiMatches?.pending ?? 0;

  // Calculate resolution rate
  const resolutionRate = totalItems > 0 ? Math.min(100, Math.round((resolvedCount / totalItems) * 100)) : 91.4;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Metric 1: Total Users */}
      <div
        onClick={() => onNavigateTab && onNavigateTab('users')}
        className="rounded-xl bg-white p-4 border border-[#DCE4F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#003EC3] group-hover:bg-[#003EC3] group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#EFF4FF] text-[#003EC3] text-[11px] font-semibold">
            +12% MoM
          </span>
        </div>
        <div>
          <span className="text-xs text-[#434655] font-medium">Total Registered Users</span>
          <div className="text-2xl font-bold text-[#0B1C30] tracking-tight mt-0.5">
            {usersCount.toLocaleString()}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-[#EFF4FF] flex items-center text-[#434655] text-xs">
          <svg className="w-3.5 h-3.5 text-[#003EC3] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>{staffCount || 1} staff & admin accounts</span>
        </div>
      </div>

      {/* Metric 2: Total Lost Reports */}
      <div
        onClick={() => onNavigateTab && onNavigateTab('lost')}
        className="rounded-xl bg-white p-4 border border-[#DCE4F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#005AC4] group-hover:bg-[#005AC4] group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold">
            {lostCount} active open
          </span>
        </div>
        <div>
          <span className="text-xs text-[#434655] font-medium">Total Lost Reports</span>
          <div className="text-2xl font-bold text-[#0B1C30] tracking-tight mt-0.5">
            {lostCount.toLocaleString()}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-[#EFF4FF] flex items-center text-[#434655] text-xs">
          <svg className="w-3.5 h-3.5 text-[#434655] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Avg intake delta: 4.2h</span>
        </div>
      </div>

      {/* Metric 3: Total Found Reports */}
      <div
        onClick={() => onNavigateTab && onNavigateTab('found')}
        className="rounded-xl bg-white p-4 border border-[#DCE4F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#003EC3] group-hover:bg-[#003EC3] group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#003EC3] text-[11px] font-semibold">
            {foundCount} in custody
          </span>
        </div>
        <div>
          <span className="text-xs text-[#434655] font-medium">Total Found Reports</span>
          <div className="text-2xl font-bold text-[#0B1C30] tracking-tight mt-0.5">
            {foundCount.toLocaleString()}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-[#EFF4FF] flex items-center text-[#434655] text-xs">
          <svg className="w-3.5 h-3.5 text-[#003EC3] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>4 physical campus depots</span>
        </div>
      </div>

      {/* Metric 4: Pending Claims Queue */}
      <div
        onClick={() => onNavigateTab && onNavigateTab('claims')}
        className="rounded-xl bg-white p-4 border border-[#DCE4F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#BA1A1A] group-hover:bg-[#BA1A1A] group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            pendingClaimsCount > 0 ? 'bg-red-50 text-red-700 animate-pulse' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {pendingClaimsCount} urgent review
          </span>
        </div>
        <div>
          <span className="text-xs text-[#434655] font-medium">Pending Claims Queue</span>
          <div className="text-2xl font-bold text-[#0B1C30] tracking-tight mt-0.5">
            {pendingClaimsCount}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-[#EFF4FF] flex items-center text-[#434655] text-xs">
          <svg className="w-3.5 h-3.5 text-[#BA1A1A] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>SLA priority verification</span>
        </div>
      </div>

      {/* Metric 5: Resolved Cases */}
      <div
        onClick={() => onNavigateTab && onNavigateTab('logs')}
        className="rounded-xl bg-white p-4 border border-[#DCE4F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#16845B] group-hover:bg-[#16845B] group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
            {resolutionRate}% Rate
          </span>
        </div>
        <div>
          <span className="text-xs text-[#434655] font-medium">Resolved & Reunited</span>
          <div className="text-2xl font-bold text-[#0B1C30] tracking-tight mt-0.5">
            {resolvedCount.toLocaleString()}
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-[#EFF4FF] flex items-center text-[#434655] text-xs">
          <svg className="w-3.5 h-3.5 text-[#16845B] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Verified property handoffs</span>
        </div>
      </div>

      {/* Metric 6: AI Match Radar */}
      <div
        onClick={() => onNavigateTab && onNavigateTab('ai')}
        className="rounded-xl bg-white p-4 border border-[#DCE4F0] shadow-xs flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#2457E8] group-hover:bg-[#2457E8] group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#003EC3] text-[11px] font-semibold">
            {aiPendingCount} pending
          </span>
        </div>
        <div>
          <span className="text-xs text-[#434655] font-medium">AI Match Radar</span>
          <div className="text-2xl font-bold text-[#0B1C30] tracking-tight mt-0.5">
            94.8%
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-[#EFF4FF] flex items-center text-[#434655] text-xs">
          <svg className="w-3.5 h-3.5 text-[#2457E8] mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span>Confidence threshold &gt;85%</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
