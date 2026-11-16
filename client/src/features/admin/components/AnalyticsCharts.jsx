import React, { useState } from 'react';

/**
 * AnalyticsCharts Component
 * Visual Analytics Bento: Monthly Recovery Velocity Chart + Custody Depots Donut
 * Faithfully matches 09_admin_overview lines 154-347
 */
export const AnalyticsCharts = ({ stats = {} }) => {
  const [timeRange, setTimeRange] = useState('6m');
  const foundTotal = stats?.items?.found || 1894;
  const lostTotal = stats?.items?.lost || 1429;
  const resolvedTotal = stats?.items?.resolved || 1642;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Velocity Chart (7 cols on lg, 8 on xl) */}
      <div className="lg:col-span-7 xl:col-span-8 rounded-xl bg-white p-6 border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#EFF4FF] flex items-center justify-center text-[#003EC3]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </span>
                <h2 className="text-base font-bold text-[#0B1C30]">
                  Monthly Report & Recovery Velocity
                </h2>
              </div>
              <p className="text-xs text-[#434655] mt-1">
                Lost intake, custodian registrations, and successful returned matches over 6 months
              </p>
            </div>

            {/* Time Filter Buttons */}
            <div className="flex items-center gap-1 bg-[#EFF4FF] p-1 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setTimeRange('6m')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  timeRange === '6m'
                    ? 'bg-white text-[#003EC3] shadow-xs'
                    : 'text-[#434655] hover:text-[#0B1C30]'
                }`}
              >
                6 Months
              </button>
              <button
                onClick={() => setTimeRange('ytd')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  timeRange === 'ytd'
                    ? 'bg-white text-[#003EC3] shadow-xs'
                    : 'text-[#434655] hover:text-[#0B1C30]'
                }`}
              >
                YTD
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  timeRange === 'all'
                    ? 'bg-white text-[#003EC3] shadow-xs'
                    : 'text-[#434655] hover:text-[#0B1C30]'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* SVG Grouped Bar & Spline Chart */}
          <div className="relative w-full h-64 flex flex-col justify-end">
            {/* Grid baseline lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="w-full h-px bg-[#DCE9FF]"></div>
              <div className="w-full h-px bg-[#DCE9FF]"></div>
              <div className="w-full h-px bg-[#DCE9FF]"></div>
              <div className="w-full h-px bg-[#DCE9FF]"></div>
              <div className="w-full h-px bg-[#DCE9FF]"></div>
            </div>

            <svg className="w-full h-52 overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 700 220">
              <line stroke="#DCE9FF" strokeWidth="1.5" x1="0" x2="700" y1="210" y2="210"></line>

              {/* Month 1 */}
              <rect fill="#CBDBF5" height="120" rx="4" width="20" x="35" y="90"></rect>
              <rect fill="#005AC4" height="140" rx="4" width="20" x="60" y="70"></rect>

              {/* Month 2 */}
              <rect fill="#CBDBF5" height="100" rx="4" width="20" x="150" y="110"></rect>
              <rect fill="#005AC4" height="150" rx="4" width="20" x="175" y="60"></rect>

              {/* Month 3 */}
              <rect fill="#CBDBF5" height="145" rx="4" width="20" x="265" y="65"></rect>
              <rect fill="#005AC4" height="165" rx="4" width="20" x="290" y="45"></rect>

              {/* Month 4 */}
              <rect fill="#CBDBF5" height="90" rx="4" width="20" x="380" y="120"></rect>
              <rect fill="#005AC4" height="130" rx="4" width="20" x="405" y="80"></rect>

              {/* Month 5 */}
              <rect fill="#CBDBF5" height="125" rx="4" width="20" x="495" y="85"></rect>
              <rect fill="#005AC4" height="170" rx="4" width="20" x="520" y="40"></rect>

              {/* Month 6 (Current Live) */}
              <rect fill="#CBDBF5" height="160" rx="4" width="20" x="610" y="50"></rect>
              <rect fill="#003EC3" height="185" rx="4" width="20" x="635" y="25"></rect>

              {/* Spline Curve for Reunited Deliveries */}
              <path d="M 55 105 Q 165 75 278 60 T 505 50 T 645 32" fill="none" stroke="#2457E8" strokeLinecap="round" strokeWidth="3.5"></path>
              <circle cx="55" cy="105" fill="#ffffff" r="4.5" stroke="#2457E8" strokeWidth="2.5"></circle>
              <circle cx="165" cy="78" fill="#ffffff" r="4.5" stroke="#2457E8" strokeWidth="2.5"></circle>
              <circle cx="278" cy="60" fill="#ffffff" r="4.5" stroke="#2457E8" strokeWidth="2.5"></circle>
              <circle cx="395" cy="95" fill="#ffffff" r="4.5" stroke="#2457E8" strokeWidth="2.5"></circle>
              <circle cx="505" cy="50" fill="#ffffff" r="4.5" stroke="#2457E8" strokeWidth="2.5"></circle>
              <circle cx="645" cy="32" fill="#2457E8" r="5.5" stroke="#ffffff" strokeWidth="2.5"></circle>
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between items-center px-4 pt-3 text-xs text-[#434655] font-mono">
              <span>OCT</span>
              <span>NOV</span>
              <span>DEC</span>
              <span>JAN</span>
              <span>FEB</span>
              <span className="font-bold text-[#003EC3]">MAR (LIVE)</span>
            </div>
          </div>
        </div>

        {/* Legend Footer */}
        <div className="mt-6 pt-4 border-t border-[#EFF4FF] flex flex-wrap items-center justify-between gap-4 bg-[#EFF4FF]/60 p-3 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#CBDBF5]"></span>
              <span className="text-xs text-[#434655] font-medium">Lost Reports Intake</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#005AC4]"></span>
              <span className="text-xs text-[#434655] font-medium">Found Registered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-[#2457E8]"></span>
              <span className="text-xs text-[#0B1C30] font-semibold">Reunited Deliveries</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#003EC3] text-xs font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>+18.4% Recovery Rate</span>
          </div>
        </div>
      </div>

      {/* Depots & Intake Distribution (5 cols on lg, 4 on xl) */}
      <div className="lg:col-span-5 xl:col-span-4 rounded-xl bg-white p-6 border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#EFF4FF] flex items-center justify-center text-[#003EC3]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              <h2 className="text-base font-bold text-[#0B1C30]">Custody Depots</h2>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#EFF4FF] text-[#434655] text-xs font-mono font-semibold">
              4 Hubs
            </span>
          </div>
          <p className="text-xs text-[#434655] mb-4">
            Geographic volume across physical holding stations
          </p>

          {/* Donut Chart Visual */}
          <div className="flex items-center justify-center my-3">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" fill="none" r="48" stroke="#eff4ff" strokeWidth="14"></circle>
                {/* Central Library 38% */}
                <circle cx="60" cy="60" fill="none" r="48" stroke="#003ec3" strokeDasharray="301.59" strokeDashoffset="186.98" strokeLinecap="round" strokeWidth="14"></circle>
                {/* Tech Center 26% */}
                <circle cx="60" cy="60" fill="none" r="48" stroke="#005ac4" strokeDasharray="301.59" strokeDashoffset="223.17" strokeLinecap="round" strokeWidth="14" transform="rotate(136.8 60 60)"></circle>
                {/* Athletics Complex 21% */}
                <circle cx="60" cy="60" fill="none" r="48" stroke="#4e8eff" strokeDasharray="301.59" strokeDashoffset="238.25" strokeLinecap="round" strokeWidth="14" transform="rotate(230.4 60 60)"></circle>
                {/* Student Union 15% */}
                <circle cx="60" cy="60" fill="none" r="48" stroke="#bbc6e8" strokeDasharray="301.59" strokeDashoffset="256.35" strokeLinecap="round" strokeWidth="14" transform="rotate(306 60 60)"></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-[#0B1C30] leading-none">
                  {foundTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#434655] uppercase tracking-wider font-semibold mt-1">
                  Cataloged
                </span>
              </div>
            </div>
          </div>

          {/* Progress Rows */}
          <div className="flex flex-col gap-2.5 mt-3">
            <div className="p-2.5 rounded-lg bg-[#EFF4FF] flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0B1C30]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#003EC3]"></span>
                  Central Library (Main Vault)
                </span>
                <span className="font-mono text-[#003EC3]">38% · 720 items</span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#003EC3] h-full rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#EFF4FF] flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0B1C30]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#005AC4]"></span>
                  Science & Tech Center Desk
                </span>
                <span className="font-mono text-[#005AC4]">26% · 492 items</span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#005AC4] h-full rounded-full" style={{ width: '26%' }}></div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#EFF4FF] flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0B1C30]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4E8EFF]"></span>
                  Athletics & Recreation Hub
                </span>
                <span className="font-mono text-[#00275D]">21% · 398 items</span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#4E8EFF] h-full rounded-full" style={{ width: '21%' }}></div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#EFF4FF] flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0B1C30]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BBC6E8]"></span>
                  Student Union Welcome Center
                </span>
                <span className="font-mono text-[#424D6A]">15% · 284 items</span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#BBC6E8] h-full rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#EFF4FF] flex items-center justify-between text-xs text-[#434655]">
          <span>Depot capacity: 64% used</span>
          <span className="text-[#003EC3] font-semibold flex items-center">
            Status: Operational
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
