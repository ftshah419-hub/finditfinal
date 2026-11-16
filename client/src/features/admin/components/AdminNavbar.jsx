import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * AdminNavbar Component
 * Master top navigation bar conforming directly to stitch_findit_saas_ui_platform
 */
export const AdminNavbar = ({
  activeTab = 'overview',
  onTabChange,
  pendingAlertsCount = 0,
  onRefresh,
  onToggleSidebar
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'lost', label: 'Lost Reports' },
    { id: 'found', label: 'Found Reports' },
    { id: 'claims', label: 'Claims' },
    { id: 'ai', label: 'AI Matching' },
    { id: 'logs', label: 'Analytics & Logs' },
    { id: 'categories', label: 'Categories' },
    { id: 'reports', label: 'Complaints' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#ffffff]/95 backdrop-blur-xl border-b border-[#DCE4F0] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo & Platform Title */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            aria-label="Open Navigation Menu"
            className="xl:hidden p-2 rounded-lg text-[#434655] hover:bg-[#EFF4FF] hover:text-[#0B1C30] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#003EC3] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" strokeWidth="2.2" strokeDasharray="3 2" />
                <circle cx="11" cy="11" r="3" fill="#ffffff" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 16l4 4" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-[#0B1C30]">
              FIND<span className="text-[#2457E8]">IT</span>
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#2457E8] text-white font-medium text-[10px] tracking-wider uppercase">
              ADMIN CONSOLE
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E5EEFF] text-[#003EC3] font-semibold'
                      : 'text-[#434655] hover:text-[#0B1C30] hover:bg-[#EFF4FF]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Tools & User Identity */}
        <div className="flex items-center gap-3">
          {/* Refresh Action */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Data"
              className="p-2 rounded-lg text-[#434655] hover:bg-[#EFF4FF] hover:text-[#0B1C30] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="System Notifications"
              className="relative p-2 rounded-lg text-[#434655] hover:bg-[#EFF4FF] hover:text-[#0B1C30] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {pendingAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#BA1A1A] ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#DCE4F0] p-4 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#DCE4F0]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0B1C30]">
                    System Telemetry Alerts
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#003EC3] font-semibold">
                    {pendingAlertsCount} Pending
                  </span>
                </div>
                <div className="mt-3 text-xs text-[#434655] space-y-2">
                  <div
                    onClick={() => {
                      onTabChange('claims');
                      setShowNotifications(false);
                    }}
                    className="p-2 rounded-lg hover:bg-[#EFF4FF] cursor-pointer flex items-center justify-between"
                  >
                    <span>Pending Claims Queue</span>
                    <span className="font-semibold text-[#BA1A1A]">Action Required</span>
                  </div>
                  <div
                    onClick={() => {
                      onTabChange('lost');
                      setShowNotifications(false);
                    }}
                    className="p-2 rounded-lg hover:bg-[#EFF4FF] cursor-pointer flex items-center justify-between"
                  >
                    <span>Item Reports Moderation</span>
                    <span className="font-semibold text-[#2457E8]">Review</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Identity Display */}
          <div className="flex items-center gap-3 pl-2 border-l border-[#DCE4F0]">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#0B1C30] leading-tight">{user?.name || 'Administrator'}</p>
              <span className="text-[11px] text-[#005AC4] font-medium">Superadmin</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#003EC3] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="hidden sm:inline-flex py-1.5 px-3 bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-medium rounded-lg transition-colors border border-[#DCE4F0]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
