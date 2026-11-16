import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

export const UserNavbar = ({
  activeTab,
  onSelectTab,
  unreadCount = 0,
  onOpenNotifications,
  onOpenProfile,
  onSearchClick
}) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'user-home-overview', label: 'Dashboard', icon: 'dashboard' },
    { id: 'browse-items', label: 'Browse Items', icon: 'travel_explore' },
    { id: 'report-lost-item', label: 'Report Lost', icon: 'search_off' },
    { id: 'report-found-item', label: 'Report Found', icon: 'pan_tool' },
    { id: 'my-reports', label: 'My Reports', icon: 'inventory_2' },
    { id: 'my-claims', label: 'My Claims', icon: 'verified_user' },
    { id: 'ai-smart-match', label: 'AI Smart Match', icon: 'radar' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/60">
      <div className="h-16 w-full px-margin flex items-center justify-between gap-space-md">
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-space-lg shrink-0">
          <button
            onClick={() => onSelectTab('user-home-overview')}
            className="flex items-center gap-space-sm cursor-pointer focus:outline-none text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px]">explore</span>
            </div>
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-primary">
              FIND<span className="text-secondary-container">IT</span>
            </span>
          </button>

          <nav className="hidden xl:flex items-center gap-space-xs">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-space-sm py-1.5 rounded-lg font-label-lg text-label-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & User Pill */}
        <div className="flex items-center gap-space-md shrink-0">
          {/* Quick Search Trigger */}
          <div
            onClick={onSearchClick}
            className="hidden md:flex items-center gap-space-xs px-space-md py-1.5 bg-surface-container-low rounded-lg text-on-surface-variant border border-outline-variant/40 cursor-pointer hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span className="font-body-sm text-body-sm pr-space-md">Quick search items...</span>
            <kbd className="font-code-tabular text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-medium">
              ⌘K
            </kbd>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error text-[9px] text-white font-bold items-center justify-center"></span>
              </span>
            )}
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-space-sm pl-space-xs p-1 rounded-xl hover:bg-surface-container transition-colors cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm text-on-primary font-bold text-sm">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface leading-tight font-semibold">
                  {user?.name || 'Verified User'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {user?.role === 'ADMIN' ? 'Platform Admin' : 'Verified Member'}
                </span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant hidden lg:inline">
                expand_more
              </span>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-surface-container-high">
                  <p className="font-label-md text-label-md font-semibold text-on-surface">{user?.name}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full px-4 py-2 text-left font-label-md text-label-md text-on-surface hover:bg-surface-container-low flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                  My Profile & Settings
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onSelectTab('my-reports');
                  }}
                  className="w-full px-4 py-2 text-left font-label-md text-label-md text-on-surface hover:bg-surface-container-low flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">inventory_2</span>
                  My Reported Items
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onSelectTab('my-claims');
                  }}
                  className="w-full px-4 py-2 text-left font-label-md text-label-md text-on-surface hover:bg-surface-container-low flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary-container">verified_user</span>
                  My Claims Dossiers
                </button>

                <div className="border-t border-surface-container-high my-1"></div>

                <button
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await logout();
                    window.location.href = '/login';
                  }}
                  className="w-full px-4 py-2 text-left font-label-md text-label-md text-error hover:bg-error-container/30 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-container-lowest border-b border-outline-variant/30 px-margin py-space-md flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-left font-label-lg text-label-lg flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default UserNavbar;
