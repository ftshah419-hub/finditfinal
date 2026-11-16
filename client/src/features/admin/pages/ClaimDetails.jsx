import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import StatusBadge from '../components/StatusBadge';
import ClaimReviewModal from '../components/ClaimReviewModal';

/**
 * ClaimDetails Page
 * Full forensic verification dossier for an individual claim
 */
export const ClaimDetails = ({ claimId, onBack, onSelectItem }) => {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchClaimDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch claims list and locate target or use direct item details
      const result = await adminApi.getClaims({ limit: 50 });
      const found = (result.claims || []).find((c) => c._id === claimId);
      if (found) {
        setClaim(found);
      } else {
        setError('Claim record not found in active verification pool.');
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve claim verification details.');
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails();
    }
  }, [claimId, fetchClaimDetails]);

  const handleApprove = async (id) => {
    await adminApi.approveClaim(id);
    fetchClaimDetails();
  };

  const handleReject = async (id, note) => {
    await adminApi.rejectClaim(id, note);
    fetchClaimDetails();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#DCE4F0] p-12 text-center shadow-xs">
        <div className="inline-block w-8 h-8 border-3 border-[#003EC3]/20 border-t-[#003EC3] rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-[#434655] font-medium">Retrieving claim dossier and evidence records...</p>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="bg-white rounded-xl border border-[#DCE4F0] p-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-[#BA1A1A]">{error || 'Claim not found.'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold rounded-lg"
        >
          Return to Claims Queue
        </button>
      </div>
    );
  }

  const item = claim.itemId || {};
  const claimant = claim.claimantId || {};

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003EC3] hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Claims Queue</span>
        </button>

        {claim.status === 'PENDING' && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 rounded-lg bg-[#003EC3] hover:bg-[#2457E8] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Authorize Release / Reject
          </button>
        )}
      </div>

      {/* Main Verification Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Claimant Affidavit (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#DCE4F0] p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFF4FF]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#003EC3]">
                #CLM-{claim._id?.slice(-4)?.toUpperCase()}
              </span>
              <StatusBadge status={claim.status} />
            </div>
            <span className="text-xs text-[#434655]">
              Submitted: {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase text-[#434655] tracking-wider block mb-2">
              Claimant Identification
            </span>
            <div className="p-4 rounded-xl bg-[#EFF4FF] border border-[#DCE4F0] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#434655]">Full Name:</span>
                <span className="font-bold text-[#0B1C30]">{claimant.name || 'Anonymous User'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#434655]">Campus Email:</span>
                <span className="font-medium text-[#0B1C30]">{claimant.email || 'N/A'}</span>
              </div>
              {claimant.phone && (
                <div className="flex justify-between">
                  <span className="text-[#434655]">Contact Phone:</span>
                  <span className="font-medium text-[#003EC3]">{claimant.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase text-[#434655] tracking-wider block mb-1">
              Affidavit Proof of Ownership
            </span>
            <div className="p-4 rounded-xl bg-[#EFF4FF]/60 border border-[#DCE4F0] text-xs text-[#0B1C30] leading-relaxed whitespace-pre-wrap">
              {claim.proofDescription}
            </div>
          </div>

          {claim.evidence && claim.evidence.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase text-[#434655] tracking-wider block mb-2">
                Attached Digital Evidence
              </span>
              <div className="grid grid-cols-3 gap-2">
                {claim.evidence.map((ev, idx) => (
                  <a
                    key={idx}
                    href={typeof ev === 'string' ? ev : ev.url}
                    target="_blank"
                    rel="noreferrer"
                    className="aspect-square rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] overflow-hidden hover:opacity-80 transition-opacity block"
                  >
                    <img
                      src={typeof ev === 'string' ? ev : ev.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {claim.adminNote && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Admin Decision Note:</strong> {claim.adminNote}
            </div>
          )}
        </div>

        {/* Right Column: Matched Custody Item (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#DCE4F0] p-6 shadow-xs flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EFF4FF]">
              <span className="text-xs font-bold uppercase text-[#434655] tracking-wider">
                Target Custody Found Item
              </span>
              <StatusBadge status={item.status} />
            </div>

            <div className="mt-4 flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-[#EFF4FF] overflow-hidden border border-[#DCE4F0] shrink-0">
                {item.images && item.images[0] ? (
                  <img
                    src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#434655]">
                    <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-[#0B1C30] truncate">{item.title}</h3>
                <p className="text-xs text-[#434655] mt-1">{item.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-[#434655]">
                  <span>Depot: <strong>{item.location?.city || 'Main Vault'}</strong></span>
                  <span>·</span>
                  <span>Intake: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {onSelectItem && (
              <button
                onClick={() => onSelectItem(item._id)}
                className="mt-4 w-full py-2 bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold rounded-lg transition-colors border border-[#DCE4F0]"
              >
                Inspect Full Found Property Dossier
              </button>
            )}
          </div>

          {/* Audit Rule Explanation Box */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-[#003EC3]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Forensic Custody Integrity Guarantee
            </span>
            <p className="leading-relaxed text-[11px] text-[#434655]">
              Approval is an irrevocable custody transfer. MongoDB Atlas transactions ensure atomic item resolution, preventing competing claims or race conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ClaimReviewModal
        isOpen={showReviewModal}
        claim={claim}
        onClose={() => setShowReviewModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ClaimDetails;
