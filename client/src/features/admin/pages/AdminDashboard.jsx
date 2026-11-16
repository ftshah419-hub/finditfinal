import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import adminApi from '../services/adminApi';
import useAdminData from '../hooks/useAdminData';

// Shared Layout & Components
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import DashboardStats from '../components/DashboardStats';
import AnalyticsCharts from '../components/AnalyticsCharts';
import ClaimReviewModal from '../components/ClaimReviewModal';

// Sub-Pages
import UserManagement from './UserManagement';
import UserDetails from './UserDetails';
import ItemManagement from './ItemManagement';
import ItemDetails from './ItemDetails';
import ClaimManagement from './ClaimManagement';
import ClaimDetails from './ClaimDetails';
import ReportManagement from './ReportManagement';
import CategoryManagement from './CategoryManagement';
import AIMatchReview from './AIMatchReview';
import ActivityLogs from './ActivityLogs';
import SystemSettings from './SystemSettings';

// Styles
import '../styles/admin.css';

/**
 * AdminDashboard Page
 * Master Administrative Command Hub directly conforming to stitch_findit_saas_ui_platform
 */
export const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State: sync with URL query param `tab` (e.g. ?tab=users)
  const activeTab = searchParams.get('tab') || 'overview';
  const selectedUserId = searchParams.get('userId');
  const selectedItemId = searchParams.get('itemId');
  const selectedClaimId = searchParams.get('claimId');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { stats, loading, error, pendingAlerts, refetchStats } = useAdminData();

  // Selected Claim for Quick Modal Review from Overview
  const [quickClaimReview, setQuickClaimReview] = useState(null);

  const handleTabChange = (tab) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectUser = (userId) => {
    const params = new URLSearchParams();
    params.set('tab', 'users');
    params.set('userId', userId);
    setSearchParams(params);
  };

  const handleSelectItem = (itemId) => {
    const params = new URLSearchParams();
    params.set('tab', 'lost');
    params.set('itemId', itemId);
    setSearchParams(params);
  };

  const handleSelectClaim = (claimId) => {
    const params = new URLSearchParams();
    params.set('tab', 'claims');
    params.set('claimId', claimId);
    setSearchParams(params);
  };

  const handleBackToTab = (tab) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    setSearchParams(params);
  };

  const handleExportAuditLogs = () => {
    handleTabChange('logs');
  };

  const handleQuickClaimApprove = async (claimId) => {
    await adminApi.approveClaim(claimId);
    refetchStats();
  };

  const handleQuickClaimReject = async (claimId, note) => {
    await adminApi.rejectClaim(claimId, note);
    refetchStats();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans">
      {/* Master Top Navigation Bar */}
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingAlertsCount={pendingAlerts}
        onRefresh={refetchStats}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Mobile Sidebar Flyout */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content Viewport */}
      <main className="w-full pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex-1 max-w-[1600px] mx-auto">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* ── 1. OVERVIEW DASHBOARD ── */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            {/* Header Hero Banner (09_admin_overview lines 8-36) */}
            <div className="relative w-full rounded-2xl bg-white p-6 sm:p-8 border border-[#DCE4F0] shadow-xs overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#003EC3]/5 blur-3xl pointer-events-none"></div>
              <div className="absolute right-32 bottom-0 w-64 h-64 rounded-full bg-[#4E8EFF]/10 blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col gap-1.5 max-w-2xl">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EFF4FF] text-[#003EC3] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-[#DCE4F0]">
                    <span className="w-2 h-2 rounded-full bg-[#003EC3] animate-pulse"></span>
                    Operational Cluster 01 · Live
                  </span>
                  <span className="font-mono text-xs text-[#434655]">
                    Session Active · Administrator Privileges
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1C30] tracking-tight">
                  Welcome back, Administrator {user?.name || 'Sarah'}
                </h1>
                <p className="text-sm text-[#434655] leading-relaxed">
                  Campus-wide lost and found network health, claim processing queues, and real-time intake telemetry.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={handleExportAuditLogs}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#0B1C30] text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-[#DCE4F0] shadow-xs"
                >
                  <svg className="w-4 h-4 text-[#005AC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Export Audit Logs</span>
                </button>
                <button
                  onClick={() => handleTabChange('found')}
                  className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#003EC3] hover:bg-[#2457E8] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Register Custody Item</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Cards: 6-Card Grid */}
            <DashboardStats stats={stats} onNavigateTab={handleTabChange} />

            {/* Visual Analytics Bento (Velocity Chart + Depots Donut) */}
            <AnalyticsCharts stats={stats} />

            {/* Bottom Section: High Priority Claims & Live Activity Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* High-Priority Claims Signature Queue (8 cols) */}
              <div className="lg:col-span-7 xl:col-span-8 rounded-2xl bg-white p-6 border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EFF4FF] gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A]"></span>
                        <h2 className="text-base font-bold text-[#0B1C30]">
                          High-Priority Claims Signature Queue
                        </h2>
                      </div>
                      <p className="text-xs text-[#434655] mt-0.5">
                        Requires administrative verification before release authorization
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#BA1A1A] text-xs font-bold self-start sm:self-auto border border-red-200">
                      {stats?.claims?.pending || 3} Action Queue
                    </span>
                  </div>

                  {/* Claims List Rows */}
                  <div className="flex flex-col gap-3 mt-4">
                    {(stats?.recentClaims && stats.recentClaims.length > 0
                      ? stats.recentClaims.slice(0, 3)
                      : [
                          {
                            _id: 'CLM-4910',
                            status: 'PENDING',
                            proofDescription: 'Serial match verified via hardware intake log.',
                            claimantId: { name: 'David Chen', email: 'david.chen@campus.edu' },
                            itemId: {
                              title: 'MacBook Pro 16" Space Gray (M3 Max)',
                              location: { city: 'Tech Depot Safe B-04' },
                              images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80']
                            }
                          },
                          {
                            _id: 'CLM-4908',
                            status: 'PENDING',
                            proofDescription: 'Photo ID validated by front-desk officer.',
                            claimantId: { name: 'Elena Rostova', email: 'elena.rostova@campus.edu' },
                            itemId: {
                              title: 'Bellroy Leather Folio Wallet + State ID',
                              location: { city: 'Central Library Front' },
                              images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80']
                            }
                          },
                          {
                            _id: 'CLM-4899',
                            status: 'PENDING',
                            proofDescription: 'Bluetooth pairing handshake verified.',
                            claimantId: { name: 'Marcus Vance', email: 'm.vance@campus.edu' },
                            itemId: {
                              title: 'Sony WH-1000XM5 Noise Canceling Headphones',
                              location: { city: 'Athletics Locker A-12' },
                              images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80']
                            }
                          }
                        ]
                    ).map((clm, i) => {
                      const item = clm.itemId || {};
                      const claimant = clm.claimantId || {};
                      return (
                        <div
                          key={clm._id || i}
                          className="p-4 rounded-xl bg-[#EFF4FF]/50 hover:bg-[#EFF4FF] border border-[#DCE4F0] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-[#DCE4F0] shrink-0">
                              {item.images && item.images[0] ? (
                                <img
                                  src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#434655]">
                                  <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-[#003EC3]">
                                  #{clm._id?.slice(-8)?.toUpperCase()}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#003EC3] text-[10px] font-bold">
                                  94% AI Match
                                </span>
                                <span className="text-[11px] text-[#434655]">
                                  Depot: {item.location?.city || 'Main Vault'}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-[#0B1C30] truncate mt-0.5">
                                {item.title || 'Custody Property'}
                              </h3>
                              <p className="text-xs text-[#434655]">
                                Claimant: <strong className="text-[#0B1C30]">{claimant.name || 'Anonymous'}</strong> · {clm.proofDescription}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            <button
                              onClick={() => handleSelectClaim(clm._id)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE4F0] text-[#0B1C30] text-xs font-semibold hover:bg-[#E5EEFF] transition-colors"
                            >
                              Inspect Match
                            </button>
                            <button
                              onClick={() => setQuickClaimReview(clm)}
                              className="px-3 py-1.5 rounded-lg bg-[#003EC3] hover:bg-[#2457E8] text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                              Sign & Release
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFF4FF] flex items-center justify-between text-xs">
                  <span className="text-[#434655]">Showing active signature queue</span>
                  <button
                    onClick={() => handleTabChange('claims')}
                    className="font-semibold text-[#003EC3] hover:underline flex items-center gap-1"
                  >
                    <span>View All Pending Claims Queue</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Live Activity Stream (4 cols) */}
              <div className="lg:col-span-5 xl:col-span-4 rounded-2xl bg-white p-6 border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#EFF4FF]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#EFF4FF] flex items-center justify-center text-[#003EC3]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </span>
                      <h2 className="text-base font-bold text-[#0B1C30]">Live Activity Stream</h2>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-[#003EC3] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#003EC3] animate-ping"></span>
                      Streaming
                    </span>
                  </div>

                  {/* Audit Timeline */}
                  <div className="mt-4 relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCE9FF]">
                    {(stats?.recentLogs && stats.recentLogs.length > 0
                      ? stats.recentLogs.slice(0, 4)
                      : [
                          {
                            action: 'CLAIM_SUBMITTED',
                            description: 'User submitted ownership affidavit for MacBook Pro 16".',
                            createdAt: new Date().toISOString()
                          },
                          {
                            action: 'ITEM_APPROVED',
                            description: 'Custodian verified and approved found AirPods Max intake.',
                            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
                          },
                          {
                            action: 'AI_MATCH_GENERATED',
                            description: 'High correlation candidate identified between lost wallet & desk intake.',
                            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
                          },
                          {
                            action: 'CLAIM_APPROVED',
                            description: 'Property handoff authorized by Superadmin Sarah Jenkins.',
                            createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
                          }
                        ]
                    ).map((evt, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-[#003EC3] border-2 border-white shadow-xs"></div>
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0B1C30]">
                              {evt.action?.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono text-[10px] text-[#434655]">
                              {evt.createdAt ? new Date(evt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                          <p className="text-xs text-[#434655] mt-0.5 leading-snug">
                            {evt.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EFF4FF] flex justify-end">
                  <button
                    onClick={() => handleTabChange('logs')}
                    className="font-semibold text-xs text-[#003EC3] hover:underline"
                  >
                    View Forensic Audit Journal →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. USER MANAGEMENT / USER DETAILS ── */}
        {activeTab === 'users' && (
          selectedUserId ? (
            <UserDetails
              userId={selectedUserId}
              onBack={() => handleBackToTab('users')}
              onSelectItem={handleSelectItem}
            />
          ) : (
            <UserManagement onSelectUser={handleSelectUser} />
          )
        )}

        {/* ── 3. LOST REPORTS / FOUND REPORTS / ITEM DETAILS ── */}
        {(activeTab === 'lost' || activeTab === 'found') && (
          selectedItemId ? (
            <ItemDetails
              itemId={selectedItemId}
              onBack={() => handleBackToTab(activeTab)}
              onSelectClaim={handleSelectClaim}
            />
          ) : (
            <ItemManagement
              initialType={activeTab === 'lost' ? 'LOST' : 'FOUND'}
              onSelectItem={handleSelectItem}
            />
          )
        )}

        {/* ── 4. CLAIM MANAGEMENT / CLAIM DETAILS ── */}
        {activeTab === 'claims' && (
          selectedClaimId ? (
            <ClaimDetails
              claimId={selectedClaimId}
              onBack={() => handleBackToTab('claims')}
              onSelectItem={handleSelectItem}
            />
          ) : (
            <ClaimManagement onSelectClaim={handleSelectClaim} />
          )
        )}

        {/* ── 5. AI NEURAL MATCHING ── */}
        {activeTab === 'ai' && <AIMatchReview />}

        {/* ── 6. ANALYTICS & AUDIT LOGS ── */}
        {activeTab === 'logs' && <ActivityLogs stats={stats} />}

        {/* ── 7. CATEGORY MANAGEMENT ── */}
        {activeTab === 'categories' && <CategoryManagement />}

        {/* ── 8. COMPLAINTS & REPORTS ── */}
        {activeTab === 'reports' && <ReportManagement />}

        {/* ── 9. SYSTEM SETTINGS ── */}
        {activeTab === 'settings' && <SystemSettings />}
      </main>

      {/* Quick Claim Review Modal from Overview */}
      <ClaimReviewModal
        isOpen={Boolean(quickClaimReview)}
        claim={quickClaimReview}
        onClose={() => setQuickClaimReview(null)}
        onApprove={handleQuickClaimApprove}
        onReject={handleQuickClaimReject}
      />
    </div>
  );
};

export default AdminDashboard;
