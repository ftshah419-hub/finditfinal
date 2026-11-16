import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import StatusBadge from '../components/StatusBadge';
import ClaimReviewModal from '../components/ClaimReviewModal';

/**
 * ClaimManagement Page
 * Claim Verification & Custody Transfer Gateway
 * Directly conforms to 13_admin_claim_verification
 */
export const ClaimManagement = ({ onSelectClaim }) => {
  const [claims, setClaims] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusTab, setStatusTab] = useState('PENDING');
  const [search, setSearch] = useState('');

  // Review Modal State
  const [selectedClaimForReview, setSelectedClaimForReview] = useState(null);

  const fetchClaims = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 12,
        status: statusTab || undefined
      };
      const result = await adminApi.getClaims(params);
      let list = result.claims || [];

      // Filter locally by search keyword if present
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (c) =>
            c.claimantId?.name?.toLowerCase().includes(q) ||
            c.claimantId?.email?.toLowerCase().includes(q) ||
            c.itemId?.title?.toLowerCase().includes(q) ||
            c._id?.toLowerCase().includes(q)
        );
      }

      setClaims(list);
      setPagination(result.pagination || { page: 1, limit: 12, total: list.length, pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to retrieve claim verification queue.');
    } finally {
      setLoading(false);
    }
  }, [statusTab, search]);

  useEffect(() => {
    fetchClaims(1);
  }, [fetchClaims]);

  const handleApprove = async (claimId) => {
    await adminApi.approveClaim(claimId);
    fetchClaims(pagination.page);
  };

  const handleReject = async (claimId, adminNote) => {
    await adminApi.rejectClaim(claimId, adminNote);
    fetchClaims(pagination.page);
  };

  const pendingCount = claims.filter((c) => c.status === 'PENDING').length;
  const approvedCount = claims.filter((c) => c.status === 'APPROVED').length;
  const rejectedCount = claims.filter((c) => c.status === 'REJECTED').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1C30] tracking-tight">
            Claim Verification & Custody Transfer Gateway
          </h1>
          <p className="text-xs text-[#434655] mt-1">
            Authorize lawful property restitutions. Approving a claim atomically marks the found item as RESOLVED.
          </p>
        </div>
      </div>

      {/* KPI Metric Ribbons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#BA1A1A] uppercase">Pending Verification</span>
          <div className="text-2xl font-bold text-[#BA1A1A] mt-1">{pendingCount}</div>
          <span className="text-[11px] text-[#434655] mt-1">Urgent admin review</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#16845B] uppercase">Approved & Ready</span>
          <div className="text-2xl font-bold text-[#16845B] mt-1">{approvedCount}</div>
          <span className="text-[11px] text-[#434655] mt-1">Passes issued for pickup</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#434655] uppercase">Rejected Claims</span>
          <div className="text-2xl font-bold text-[#0B1C30] mt-1">{rejectedCount}</div>
          <span className="text-[11px] text-[#434655] mt-1">Unverified affidavits</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#003EC3] uppercase">Avg Turnaround</span>
          <div className="text-2xl font-bold text-[#003EC3] mt-1">2.4h</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">18% faster resolution</span>
        </div>
      </div>

      {/* Filter and Tab Navigation Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center overflow-x-auto gap-1 bg-[#EFF4FF] p-1 rounded-xl w-full md:w-auto border border-[#DCE4F0]">
          <button
            onClick={() => setStatusTab('PENDING')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusTab === 'PENDING'
                ? 'bg-white text-[#003EC3] shadow-xs'
                : 'text-[#434655] hover:text-[#0B1C30]'
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setStatusTab('APPROVED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusTab === 'APPROVED'
                ? 'bg-white text-[#003EC3] shadow-xs'
                : 'text-[#434655] hover:text-[#0B1C30]'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusTab('REJECTED')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusTab === 'REJECTED'
                ? 'bg-white text-[#003EC3] shadow-xs'
                : 'text-[#434655] hover:text-[#0B1C30]'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setStatusTab('')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusTab === ''
                ? 'bg-white text-[#003EC3] shadow-xs'
                : 'text-[#434655] hover:text-[#0B1C30]'
            }`}
          >
            All Claims
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <svg className="w-4 h-4 absolute left-3 top-3 text-[#434655]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search #CLM, claimant, item..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#0B1C30] placeholder:text-[#434655] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003EC3]/20"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Claims Grid / Dossier Rows */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#DCE4F0] p-12 text-center shadow-xs">
          <div className="inline-block w-8 h-8 border-3 border-[#003EC3]/20 border-t-[#003EC3] rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-[#434655]">Loading claims queue...</p>
        </div>
      ) : claims.length > 0 ? (
        <div className="space-y-3">
          {claims.map((claim) => {
            const item = claim.itemId || {};
            const claimant = claim.claimantId || {};
            return (
              <div
                key={claim._id}
                className="p-5 rounded-2xl bg-white border border-[#DCE4F0] shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Item info */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-[#EFF4FF] overflow-hidden border border-[#DCE4F0] shrink-0">
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
                        #CLM-{claim._id?.slice(-4)?.toUpperCase()}
                      </span>
                      <StatusBadge status={claim.status} />
                      <span className="px-2 py-0.5 rounded-full bg-[#E5EEFF] text-[#003EC3] text-[11px] font-semibold">
                        94% AI Match
                      </span>
                      <span className="text-[11px] text-[#434655]">
                        Intake: {item.location?.city || 'Campus Depot Safe B'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#0B1C30] truncate mt-1">
                      {item.title || 'Found Property'}
                    </h3>

                    <p className="text-xs text-[#434655] mt-0.5">
                      Claimant: <strong className="text-[#0B1C30]">{claimant.name || 'Anonymous User'}</strong> ({claimant.email})
                    </p>

                    <p className="text-xs text-[#434655] mt-1 line-clamp-1 italic bg-[#EFF4FF] p-1.5 rounded-lg border border-[#DCE4F0]">
                      Proof: "{claim.proofDescription}"
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => {
                      if (onSelectClaim) {
                        onSelectClaim(claim._id);
                      } else {
                        setSelectedClaimForReview(claim);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold transition-colors"
                  >
                    Inspect Proof
                  </button>

                  {claim.status === 'PENDING' ? (
                    <button
                      onClick={() => setSelectedClaimForReview(claim)}
                      className="px-4 py-1.5 rounded-lg bg-[#003EC3] hover:bg-[#2457E8] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Sign & Release</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedClaimForReview(claim)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#434655] hover:bg-[#EFF4FF]"
                    >
                      Dossier
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#DCE4F0] p-12 text-center text-[#434655] text-xs">
          No claims found matching the current queue filter.
        </div>
      )}

      {/* Claim Review & Custody Transfer Modal */}
      <ClaimReviewModal
        isOpen={Boolean(selectedClaimForReview)}
        claim={selectedClaimForReview}
        onClose={() => setSelectedClaimForReview(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ClaimManagement;
