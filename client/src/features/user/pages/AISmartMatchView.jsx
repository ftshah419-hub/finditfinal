import React, { useState, useEffect } from 'react';
import userApi from '../services/userApi';

export const AISmartMatchView = ({ user, onOpenClaim, onViewItem, onNavigate }) => {
  const [lostItems, setLostItems] = useState([]);
  const [selectedLostItemId, setSelectedLostItemId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchAIMatches = async (selectedId = null) => {
    setLoading(true);
    try {
      const res = await userApi.getAIMatches(selectedId ? { lostItemId: selectedId } : {});
      if (res.data) {
        const items = res.data.lostItems || [];
        setLostItems(items);
        setMatches(res.data.matches || []);
        if (!selectedLostItemId && items.length > 0) {
          setSelectedLostItemId(items[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIMatches(selectedLostItemId);
  }, [selectedLostItemId]);

  const handleRescan = async () => {
    setScanning(true);
    setActionMsg('Re-scanning catalog using visual and geo-temporal algorithms...');
    try {
      await fetchAIMatches(selectedLostItemId);
      setActionMsg('Scan complete! Match probabilities updated.');
      setTimeout(() => setActionMsg(null), 3500);
    } finally {
      setScanning(false);
    }
  };

  const handleDismiss = async (matchId) => {
    try {
      await userApi.dismissAIMatch(matchId);
      setMatches((prev) => prev.filter((m) => m._id !== matchId));
      setActionMsg('Match suggestion dismissed.');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      console.error('Failed to dismiss match:', err);
    }
  };

  const activeLostItem = lostItems.find((i) => i._id === selectedLostItemId) || lostItems[0];
  const activeMatches = matches.filter(
    (m) => !selectedLostItemId || m.lostItemId?._id === selectedLostItemId || m.lostItemId === selectedLostItemId
  );

  return (
    <div className="flex flex-col w-full space-y-space-xl pb-space-2xl">
      {/* AI Disclaimer & Live Radar Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-high p-space-md shadow-sm border border-outline-variant/30">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md relative z-10">
          <div className="flex items-start gap-space-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">radar</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  FINDIT AI Smart Match Radar
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-space-sm py-0.5 font-label-sm text-label-sm text-primary shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-secondary-container animate-pulse"></span>
                  Neural Engine Active • v4.2
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-4xl">
                AI suggestions are algorithmic similarity recommendations based on multi-factor metadata matching. They do{' '}
                <strong className="text-on-surface font-semibold">NOT</strong> constitute verified legal ownership.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-xs self-start lg:self-center shrink-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">
              Continuous campus sweep
            </span>
            <button
              onClick={handleRescan}
              disabled={scanning}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-container-lowest px-space-sm py-1.5 font-label-md text-label-md text-secondary hover:bg-surface-container transition-colors shadow-xs cursor-pointer border border-outline-variant/30 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[16px] ${scanning ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{scanning ? 'Scanning...' : 'Re-scan Catalog'}</span>
            </button>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-primary-fixed/40 border border-primary/20 text-on-primary-fixed text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Lost Item Selector Context Switcher */}
      {lostItems.length > 0 ? (
        <div className="flex flex-col space-y-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-md text-label-md uppercase tracking-wider text-outline font-semibold">
                Comparing against your lost report
              </span>
              <span className="material-symbols-outlined text-[16px] text-outline">help_outline</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {lostItems.length} Active Lost Reports in Orbit
            </span>
          </div>

          {/* Switcher Pills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {lostItems.map((item) => {
              const isSelected = (selectedLostItemId || lostItems[0]._id) === item._id;
              const matchCount = matches.filter(
                (m) => m.lostItemId?._id === item._id || m.lostItemId === item._id
              ).length;

              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedLostItemId(item._id)}
                  className={`relative flex items-center justify-between p-space-md rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-surface-container-lowest shadow-md border-primary/40'
                      : 'bg-surface-container-lowest/70 hover:bg-surface-container-lowest shadow-xs border-outline-variant/30'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container rounded-l-xl"></div>
                  )}

                  <div className="flex items-center gap-space-md pl-space-xs">
                    <div className="h-12 w-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[26px]">
                        {item.categoryId?.name?.toLowerCase().includes('phone') ||
                        item.categoryId?.name?.toLowerCase().includes('electronic')
                          ? 'devices'
                          : 'inventory_2'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-space-xs">
                        <span className="font-title-md text-title-md text-on-surface font-semibold truncate max-w-[200px]">
                          {item.title}
                        </span>
                        {isSelected && (
                          <span className="inline-flex rounded-full bg-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm text-on-secondary-fixed font-semibold">
                            Active Selection
                          </span>
                        )}
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Report #{item._id.slice(-4).toUpperCase()} • Reported{' '}
                        {new Date(item.itemDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-sm">
                    <div className="text-right hidden sm:block">
                      <span className="block font-label-sm text-label-sm text-primary font-semibold">
                        {matchCount} Matches Detected
                      </span>
                      <span className="font-code-tabular text-body-sm text-on-surface-variant">
                        {matchCount > 0 ? 'Active Cluster' : 'Standby'}
                      </span>
                    </div>
                    <span
                      className={`material-symbols-outlined ${
                        isSelected ? 'text-primary' : 'text-outline'
                      }`}
                    >
                      {isSelected ? 'check_circle' : 'chevron_right'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-center">
          <p className="font-label-lg text-label-lg font-semibold text-on-surface">
            No Lost Reports Registered Yet
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            File a lost property report to enable the FINDIT AI Neural Engine to scan against campus intakes.
          </p>
          <button
            onClick={() => onNavigate('report-lost-item')}
            className="mt-3 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold"
          >
            Report Lost Item
          </button>
        </div>
      )}

      {/* Primary Matches Display */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : activeMatches.length === 0 ? (
        <div className="p-12 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-[42px] text-outline-variant mb-2">radar</span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No High-Confidence Matches Yet</h3>
          <p className="text-xs text-on-surface-variant max-w-md mt-1">
            Our AI radar is actively monitoring new found item intake across campus security desks and collection depots.
            You will be automatically notified when a match candidate is identified.
          </p>
        </div>
      ) : (
        <div className="space-y-space-xl">
          {activeMatches.map((match) => {
            const lost = match.lostItemId;
            const found = match.foundItemId;
            return (
              <div
                key={match._id}
                className="rounded-xl bg-surface-container-lowest shadow-md overflow-hidden border border-outline-variant/30"
              >
                {/* Top Score Header Banner */}
                <div className="bg-gradient-to-r from-surface-container via-surface-container-low to-surface-container-lowest p-space-md flex flex-wrap items-center justify-between gap-space-md border-b border-surface-container-high">
                  <div className="flex items-center gap-space-md">
                    {/* Radial score indicator */}
                    <div className="relative flex h-16 w-16 items-center justify-center shrink-0">
                      <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 36 36">
                        <path
                          className="text-surface-container-highest"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                        ></path>
                        <path
                          className="text-primary-container"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray={`${match.similarityScore}, 100`}
                          strokeLinecap="round"
                          strokeWidth="3.5"
                        ></path>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-title-md text-title-md text-primary font-bold">
                          {match.similarityScore}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed px-2.5 py-0.5 font-label-md text-label-md text-on-primary-fixed font-semibold">
                          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                          {match.similarityScore >= 80 ? 'Very High Match Probability' : 'Moderate Match Probability'}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-code-tabular">
                          Found Catalog Ref: #{found?._id ? found._id.slice(-6).toUpperCase() : 'FND-8821'}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        High optical & multi-point description correlation between reported loss and physical turned-in property.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDismiss(match._id)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface-variant cursor-pointer"
                    >
                      Dismiss
                    </button>
                    {found && (
                      <button
                        onClick={() => onOpenClaim(found)}
                        className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>Initiate Verification Claim</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Comparison Details Grid */}
                <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  {/* Left: Your Lost Report */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 uppercase">
                          YOUR LOST REPORT
                        </span>
                        <span className="font-code-tabular text-xs text-on-surface-variant">
                          {lost?.itemDate ? new Date(lost.itemDate).toLocaleDateString() : 'Logged'}
                        </span>
                      </div>
                      <h4 className="font-title-md text-title-md font-semibold text-on-surface">
                        {lost?.title || activeLostItem?.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-3">
                        {lost?.description || activeLostItem?.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-surface-container text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                      <span className="truncate">
                        {lost?.location?.address || activeLostItem?.location?.address}, {lost?.location?.city || activeLostItem?.location?.city}
                      </span>
                    </div>
                  </div>

                  {/* Right: Discovered Campus Match */}
                  <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          DISCOVERED FOUND ITEM
                        </span>
                        <span className="font-code-tabular text-xs text-on-surface-variant">
                          {found?.itemDate ? new Date(found.itemDate).toLocaleDateString() : 'Turned In'}
                        </span>
                      </div>
                      <h4 className="font-title-md text-title-md font-semibold text-on-surface">
                        {found?.title || 'Found Property Candidate'}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-3">
                        {found?.description || 'Item deposited with campus collection security desk.'}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-surface-container text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-secondary">pin_drop</span>
                      <span className="truncate">
                        {found?.location?.address || 'Security Desk'}, {found?.location?.city || 'Campus Hub'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Features & Differences */}
                <div className="px-space-lg pb-space-lg flex flex-col gap-2">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                    Neural Verification Analysis
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="flex flex-col gap-1">
                      {match.matchingFeatures && match.matchingFeatures.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-emerald-700">
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1">
                      {match.differences && match.differences.map((d, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-amber-800">
                          <span className="material-symbols-outlined text-[16px]">info</span>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AISmartMatchView;
