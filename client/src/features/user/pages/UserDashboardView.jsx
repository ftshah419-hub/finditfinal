import React from 'react';
import ItemCard from '../components/ItemCard';

export const UserDashboardView = ({
  user,
  stats,
  recentNotifications,
  topAIMatch,
  liveCampusItems,
  onNavigate,
  onViewItem,
  onClaimItem
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col w-full">
      {/* Top Welcome & System Status Bar */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-lg shadow-sm mb-space-xl border border-outline-variant/30">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-primary-container/10 via-secondary-container/5 to-transparent blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md relative z-10">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-code-tabular text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                CAMPUS NETWORK ACTIVE
              </span>
              <span className="font-body-sm text-body-sm text-outline hidden sm:inline">|</span>
              <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                {currentDate}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
              Welcome back, <span className="text-primary font-bold">{user?.name || 'Alex Chen'}</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Your campus recovery hub has updated match predictions.{' '}
              {stats?.aiMatchesCount > 0 ? (
                <span className="font-semibold text-primary">
                  {stats.aiMatchesCount} potential match requires your immediate review.
                </span>
              ) : (
                'All reports and campus collection depots are synchronized.'
              )}
            </p>
          </div>

          {/* Quick Status Metric Ring */}
          <div className="flex items-center gap-space-lg shrink-0 bg-surface-container-lowest/90 backdrop-blur-sm p-space-sm px-4 rounded-xl shadow-sm border border-outline-variant/30">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-highest"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                ></path>
                <path
                  className="text-primary"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="94, 100"
                  strokeLinecap="round"
                  strokeWidth="3"
                ></path>
              </svg>
              <span className="absolute font-code-tabular font-label-md text-label-md text-on-surface font-semibold">
                94%
              </span>
            </div>
            <div className="flex flex-col pr-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Audit Integrity
              </span>
              <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                Identity Level 3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-lg mb-space-xl">
        {/* Stat 1: Total Lost Reports */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium tracking-wide">
              TOTAL LOST REPORTS
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">search_off</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display text-display text-on-surface font-bold tracking-tight">
                {stats?.totalLost || 0}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-normal">reports filed</span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 px-2 py-1 rounded bg-secondary-fixed/50 w-fit">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-on-secondary-fixed font-semibold">
                {stats?.aiMatchesCount || 0} smart match alert
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2: Total Found Reports */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium tracking-wide">
              TOTAL FOUND REPORTS
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
              <span className="material-symbols-outlined text-[22px]">pan_tool</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display text-display text-on-surface font-bold tracking-tight">
                {stats?.totalFound || 0}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-normal">items turned in</span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-high w-fit">
              <span className="material-symbols-outlined text-secondary text-[14px]">done_all</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                {stats?.pendingReports || 0} under moderation
              </span>
            </div>
          </div>
        </div>

        {/* Stat 3: Active Claims */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium tracking-wide">
              ACTIVE CLAIMS
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container group-hover:bg-primary-container group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display text-display text-on-surface font-bold tracking-tight">
                {stats?.activeClaims || 0}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-normal">claims active</span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-highest w-fit">
              <span className="material-symbols-outlined text-primary text-[14px]">hourglass_top</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                Under desk verification
              </span>
            </div>
          </div>
        </div>

        {/* Stat 4: Resolved Recoveries */}
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-md">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium tracking-wide">
              RESOLVED RECOVERIES
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-display text-display text-on-surface font-bold tracking-tight">
                {stats?.resolvedRecoveries || stats?.resolvedClaims || 0}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant font-normal">items returned</span>
            </div>
            <div className="mt-space-sm flex items-center gap-1.5 px-2 py-1 rounded bg-secondary-fixed/40 w-fit">
              <span className="material-symbols-outlined text-secondary text-[14px]">task_alt</span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                100% verified transfer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Command Strip */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm mb-space-xl flex flex-wrap items-center justify-between gap-space-md border border-outline-variant/30">
        <div className="flex items-center gap-space-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
          <span className="font-label-lg text-label-lg text-on-surface font-semibold">Quick Actions Hub</span>
          <span className="hidden sm:inline font-body-sm text-body-sm text-on-surface-variant">
            — Register lost property, log campus findings, or search archives
          </span>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={() => onNavigate('report-lost-item')}
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary transition-all duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Report Lost Item</span>
          </button>
          <button
            onClick={() => onNavigate('report-found-item')}
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container text-primary font-label-lg text-label-lg hover:bg-surface-container-high transition-all duration-150 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">front_hand</span>
            <span>Report Found Item</span>
          </button>
          <button
            onClick={() => onNavigate('browse-items')}
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container hover:text-on-surface transition-all duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            <span>Browse Catalog</span>
          </button>
        </div>
      </div>

      {/* AI Smart Matching Radar Widget */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-highest via-surface-container-low to-surface-container-lowest p-space-lg shadow-md mb-space-xl border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="flex items-start gap-space-md max-w-3xl">
            <div className="relative w-14 h-14 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[30px]">radar</span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-label-sm text-label-sm font-semibold tracking-wider text-primary uppercase bg-primary-fixed px-2 py-0.5 rounded">
                  FINDIT AI Radar
                </span>
                <span className="font-code-tabular text-label-sm text-on-surface-variant">
                  Match Index #{topAIMatch ? topAIMatch._id.slice(-6).toUpperCase() : 'AI-9941'}
                </span>
                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  {topAIMatch ? `${topAIMatch.similarityScore}% Confidence Match` : '94% Confidence Match'}
                </span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mt-1 font-bold">
                {topAIMatch?.lostItemId
                  ? `High-Confidence Match Identified for Your "${topAIMatch.lostItemId.title}"`
                  : 'High-Confidence Neural Match Identified for Your Lost Item'}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                {topAIMatch?.foundItemId ? (
                  <>
                    Your item matches Found Report{' '}
                    <strong className="text-on-surface font-semibold">
                      "{topAIMatch.foundItemId.title}"
                    </strong>{' '}
                    deposited at{' '}
                    <span className="inline-flex items-center gap-0.5 text-secondary font-medium">
                      <span className="material-symbols-outlined text-[15px]">location_on</span>{' '}
                      {topAIMatch.foundItemId.location?.address || 'Campus Desk'}
                    </span>
                    .
                  </>
                ) : (
                  'Our multi-factor visual and metadata neural engine matches incoming findings with registered lost records.'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 self-end lg:self-center">
            <button
              onClick={() => onNavigate('ai-smart-match')}
              className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all cursor-pointer"
            >
              <span>View Match & Claim</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Split Section: Live Inventory Feed (8 Cols) vs Recent Activity Timeline (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left 8 Columns */}
        <section className="lg:col-span-8 flex flex-col gap-space-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                Live Inventory Feed
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                Recently Reported Items on Campus
              </h3>
            </div>
            <button
              onClick={() => onNavigate('browse-items')}
              className="font-label-md text-label-md text-secondary hover:text-primary font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              <span>View All Campus Feeds</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {liveCampusItems && liveCampusItems.length > 0 ? (
              liveCampusItems.slice(0, 3).map((item) => (
                <ItemCard
                  key={item._id}
                  item={item}
                  currentUser={user}
                  onViewDetails={onViewItem}
                  onClaim={onClaimItem}
                />
              ))
            ) : (
              <div className="col-span-3 p-8 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[36px] text-outline-variant mb-1">
                  inventory_2
                </span>
                <p className="font-label-lg text-label-lg text-on-surface font-semibold">No recent items</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Live reports approved by campus administrators will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Campus Location Hotspot Mini-Module */}
          <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md border border-outline-variant/30">
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[26px]">map</span>
              </div>
              <div>
                <h5 className="font-title-md text-title-md text-on-surface font-semibold">
                  Lost & Found Collection Depots
                </h5>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  4 open intake desks ready for physical property verification today.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('browse-items')}
              className="w-full md:w-auto px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Browse Registry
            </button>
          </div>
        </section>

        {/* Right 4 Columns: Recent Activity Timeline */}
        <aside className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Audit Stream
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                Recent Activity
              </h3>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col border border-outline-variant/30">
            {recentNotifications && recentNotifications.length > 0 ? (
              recentNotifications.map((notif, index) => {
                const isLast = index === recentNotifications.length - 1;
                return (
                  <div key={notif._id} className={`relative flex items-start gap-space-md ${!isLast ? 'pb-space-lg' : ''}`}>
                    {!isLast && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-surface-container-highest"></div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 z-10 shadow-xs">
                      <span className="material-symbols-outlined text-[16px]">
                        {notif.type === 'CLAIM_APPROVED' ? 'verified' : notif.type === 'AI_MATCH_FOUND' ? 'radar' : 'notifications'}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md font-semibold text-on-surface truncate">
                          {notif.title}
                        </span>
                        <span className="font-code-tabular text-[11px] text-on-surface-variant shrink-0">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] text-outline-variant mb-1">
                  history
                </span>
                <p className="font-label-md text-label-md font-semibold text-on-surface">No recent audit events</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Activity regarding your reports and claims will be logged here.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UserDashboardView;
