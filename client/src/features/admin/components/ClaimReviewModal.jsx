import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

/**
 * ClaimReviewModal Component
 * Verification & Custody Transfer Gateway Modal
 * Conforms to business rules: atomic item resolution, competing claim handling
 */
export const ClaimReviewModal = ({
  isOpen,
  claim,
  onClose,
  onApprove,
  onReject
}) => {
  const [adminNote, setAdminNote] = useState('');
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !claim) return null;

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await onApprove(claim._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve claim.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onReject(claim._id, adminNote.trim() || 'Claim could not be verified by admin.');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reject claim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={!loading ? onClose : undefined}></div>

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#DCE4F0] p-6 z-10 animate-in fade-in max-h-[90vh] overflow-y-auto admin-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#EFF4FF]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#003EC3]">
                #CLM-{claim._id?.slice(-4)?.toUpperCase()}
              </span>
              <StatusBadge status={claim.status} />
            </div>
            <h3 className="text-base font-bold text-[#0B1C30] mt-1">
              Claim Verification & Custody Transfer
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-[#434655] hover:bg-[#EFF4FF]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Warning Callout for Approval */}
        {claim.status === 'PENDING' && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong>Atomic Custody Rule:</strong> Approving this claim will automatically mark the associated Found item as <strong>RESOLVED</strong> and safely reject any competing pending claims.
            </div>
          </div>
        )}

        {/* Claimant Dossier */}
        <div className="mt-4 p-3.5 bg-[#EFF4FF] rounded-xl border border-[#DCE4F0] text-xs space-y-1.5">
          <div className="font-bold text-[#0B1C30] uppercase tracking-wider text-[11px] mb-1">
            Claimant Information
          </div>
          <div className="flex justify-between">
            <span className="text-[#434655]">Name:</span>
            <span className="font-semibold text-[#0B1C30]">{claim.claimantId?.name || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#434655]">Email:</span>
            <span className="font-medium text-[#0B1C30]">{claim.claimantId?.email || 'N/A'}</span>
          </div>
          {claim.claimantId?.phone && (
            <div className="flex justify-between">
              <span className="text-[#434655]">Phone:</span>
              <span className="font-medium text-[#0B1C30]">{claim.claimantId.phone}</span>
            </div>
          )}
        </div>

        {/* Target Found Item Dossier */}
        {claim.itemId && (
          <div className="mt-3 p-3.5 bg-white rounded-xl border border-[#DCE4F0] text-xs space-y-2">
            <div className="font-bold text-[#0B1C30] uppercase tracking-wider text-[11px]">
              Custody Item Targeted
            </div>
            <div className="flex items-center gap-3">
              {claim.itemId.images && claim.itemId.images[0] && (
                <div className="w-12 h-12 rounded-lg bg-[#EFF4FF] overflow-hidden border border-[#DCE4F0] shrink-0">
                  <img
                    src={typeof claim.itemId.images[0] === 'string' ? claim.itemId.images[0] : claim.itemId.images[0].url}
                    alt="Found item thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-[#0B1C30] truncate">{claim.itemId.title}</p>
                <p className="text-[#434655]">
                  Status: <span className="font-semibold">{claim.itemId.status}</span> · City: {claim.itemId.location?.city || 'Campus Depot'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Proof of Ownership Description */}
        <div className="mt-3 p-3.5 bg-white rounded-xl border border-[#DCE4F0] text-xs">
          <div className="font-bold text-[#0B1C30] uppercase tracking-wider text-[11px] mb-1">
            Submitted Proof of Ownership
          </div>
          <p className="text-[#434655] leading-relaxed whitespace-pre-wrap">
            {claim.proofDescription}
          </p>
        </div>

        {/* Evidence Attachments */}
        {claim.evidence && claim.evidence.length > 0 && (
          <div className="mt-3">
            <div className="font-bold text-[#434655] uppercase tracking-wider text-[11px] mb-2">
              Attached Evidence Media
            </div>
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
                    alt={`Evidence ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Rejection Note Form */}
        {isRejectMode ? (
          <form onSubmit={handleReject} className="mt-4 pt-4 border-t border-[#EFF4FF]">
            <label className="block text-xs font-bold text-[#BA1A1A] mb-1">
              Admin Rejection Note:
            </label>
            <textarea
              rows={2}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Serial number does not match registered intake logs."
              className="w-full p-2.5 rounded-lg border border-[#DCE4F0] text-xs text-[#0B1C30] focus:ring-2 focus:ring-[#BA1A1A]/20 focus:outline-none"
            ></textarea>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejectMode(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#434655] hover:bg-[#EFF4FF]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#BA1A1A] text-white hover:bg-[#93000A] shadow-xs flex items-center gap-2"
              >
                {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </form>
        ) : (
          /* Normal Actions */
          <div className="mt-6 pt-4 border-t border-[#EFF4FF] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsRejectMode(true)}
              disabled={loading || claim.status !== 'PENDING'}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#BA1A1A] hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-40"
            >
              Reject Claim
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-[#434655] hover:bg-[#EFF4FF]"
              >
                Close
              </button>
              <button
                type="button"
                disabled={loading || claim.status !== 'PENDING'}
                onClick={handleApprove}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#003EC3] hover:bg-[#2457E8] shadow-xs flex items-center gap-2 disabled:opacity-40"
              >
                {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                <span>Approve & Authorize Custody</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimReviewModal;
