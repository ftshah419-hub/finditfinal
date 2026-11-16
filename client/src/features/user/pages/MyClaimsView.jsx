import React, { useState, useEffect } from 'react';
import userApi from '../services/userApi';

export const MyClaimsView = ({ user, onNavigate, onViewItem }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await userApi.getMyClaims();
      if (res.data?.claims) {
        setClaims(res.data.claims);
      }
    } catch (err) {
      console.error('Failed to fetch user claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleWithdraw = async (claimId) => {
    if (!window.confirm('Are you sure you want to withdraw this pending claim?')) {
      return;
    }

    try {
      await userApi.withdrawClaim(claimId);
      setActionSuccess('Claim dossier withdrawn successfully.');
      setClaims((prev) =>
        prev.map((c) => (c._id === claimId ? { ...c, status: 'WITHDRAWN' } : c))
      );
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to withdraw claim.');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const totalClaims = claims.length;
  const underReview = claims.filter((c) => c.status === 'PENDING').length;
  const readyPickup = claims.filter((c) => c.status === 'APPROVED').length;
  const resolved = claims.filter((c) => c.status === 'WITHDRAWN' || c.status === 'REJECTED').length;

  return (
    <div className="flex flex-col w-full pb-space-2xl">
      {/* Top Utility Bar / Page Header Context */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs text-primary font-label-md">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>AUDIT & RESOLUTION CENTER</span>
            <span className="text-outline-variant">•</span>
            <span className="font-code-tabular text-on-surface-variant uppercase">
              LOGGED IN AS {user?.name || 'USER'}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Claims</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Monitor real-time custody verification progress, security approvals, and pickup authorizations for items you have claimed.
          </p>
        </div>

        {/* Quick Actions / Live Audit Pulse */}
        <div className="flex items-center gap-space-sm shrink-0">
          <div className="px-space-md py-2 rounded-xl bg-surface-container flex items-center gap-space-sm text-on-surface border border-outline-variant/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            <span className="font-label-md text-label-md font-semibold">Custodian Desk Active</span>
          </div>
          <button
            onClick={() => onNavigate('browse-items')}
            className="px-space-md py-2 rounded-xl bg-primary text-on-primary font-label-lg flex items-center gap-space-xs hover:bg-primary-container transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Submit New Claim</span>
          </button>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-2xl">
        {/* Total Claims Metric */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Total Dossiers
              </span>
              <div className="font-display text-display text-on-surface mt-1 font-bold">
                {String(totalClaims).padStart(2, '0')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">folder_managed</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-on-surface-variant font-label-sm">
            <span className="font-semibold text-on-surface">100%</span>
            <span>identity match rate</span>
          </div>
        </div>

        {/* Under Review Metric */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                Under Custody Review
              </span>
              <div className="font-display text-display text-secondary mt-1 font-bold">
                {String(underReview).padStart(2, '0')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-secondary font-label-sm">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>Pending administrative audit</span>
          </div>
        </div>

        {/* Approved / Ready for Pickup */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-[#16845B] uppercase tracking-wider">
                Approved For Pickup
              </span>
              <div className="font-display text-display text-[#16845B] mt-1 font-bold">
                {String(readyPickup).padStart(2, '0')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#16845B]/10 flex items-center justify-center text-[#16845B]">
              <span className="material-symbols-outlined text-[20px]">store</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-[#16845B] font-label-sm">
            <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
            <span>Secure pass authorized</span>
          </div>
        </div>

        {/* Closed / Resolved */}
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/30">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                Withdrawn / Closed
              </span>
              <div className="font-display text-display text-on-surface-variant mt-1 font-bold">
                {String(resolved).padStart(2, '0')}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs mt-space-md text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[14px]">archive</span>
            <span>Archived into audit vault</span>
          </div>
        </div>
      </section>

      {actionSuccess && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-600">error</span>
          <span>{actionError}</span>
        </div>
      )}

      {/* Active Claims Stream */}
      <section className="flex flex-col gap-space-lg">
        <div className="flex items-center justify-between pb-space-xs">
          <div className="flex items-center gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Active Claims Stream</h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-code-tabular text-label-sm font-semibold">
              {claims.length} DOSSIERS
            </span>
          </div>
          <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm">
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Auto-synced via Campus L&F Network</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30 flex flex-col items-center">
            <span className="material-symbols-outlined text-[42px] text-outline-variant mb-2">
              verified_user
            </span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No Claims Submitted</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mt-1">
              When you discover an item in the directory that belongs to you, submit an ownership claim to initiate custody verification.
            </p>
            <button
              onClick={() => onNavigate('browse-items')}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-sm hover:bg-primary-container transition-all cursor-pointer"
            >
              Browse Found Items
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-space-md">
            {claims.map((claim) => {
              const claimId = `#CLM-${claim._id.slice(-4).toUpperCase()}`;
              const item = claim.itemId;
              return (
                <div
                  key={claim._id}
                  className="rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-outline-variant/30"
                >
                  {/* Card Sub-header bar */}
                  <div className="bg-surface-container-low px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-md border-b border-surface-container-high">
                    <div className="flex items-center gap-space-md">
                      <span className="font-code-tabular text-label-lg font-bold text-primary px-space-sm py-0.5 rounded bg-primary-fixed/60">
                        {claimId}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          claim.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : claim.status === 'WITHDRAWN'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {claim.status === 'PENDING' ? 'Under Custody Review' : claim.status}
                      </span>

                      {claim.status === 'PENDING' && (
                        <button
                          onClick={() => handleWithdraw(claim._id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-error hover:bg-error-container/30 transition-colors cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-space-lg flex flex-col md:flex-row md:items-start justify-between gap-space-lg">
                    {/* Item snapshot */}
                    <div className="flex items-start gap-space-md flex-1">
                      <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden shrink-0 border border-outline-variant/30">
                        <img
                          src={
                            item?.images?.[0]?.url ||
                            'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={item?.title || 'Claimed Item'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                          Target Found Item
                        </span>
                        <h3
                          onClick={() => item && onViewItem(item)}
                          className="font-title-md text-title-md font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer"
                        >
                          {item?.title || 'Found Property'}
                        </h3>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[14px] text-primary">pin_drop</span>
                          <span>{item?.location?.address || 'Campus Desk'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Proof description */}
                    <div className="flex-1 p-3 rounded-xl bg-surface-container-low border border-surface-container-high">
                      <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
                        Ownership Evidence Provided
                      </span>
                      <p className="text-xs text-on-surface leading-relaxed whitespace-pre-line">
                        {claim.proofDescription}
                      </p>

                      {claim.adminNote && (
                        <div className="mt-2 pt-2 border-t border-surface-container-highest text-xs text-primary font-medium">
                          <strong>Admin Note:</strong> {claim.adminNote}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyClaimsView;
