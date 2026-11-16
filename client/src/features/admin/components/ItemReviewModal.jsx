import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

/**
 * ItemReviewModal Component
 * Modal for approving or rejecting submitted LOST and FOUND reports
 */
export const ItemReviewModal = ({
  isOpen,
  item,
  onClose,
  onApprove,
  onReject
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectingMode, setIsRejectingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !item) return null;

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await onApprove(item._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve item.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError('Please provide a specific rejection reason for the submitter.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onReject(item._id, rejectionReason.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reject item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={!loading ? onClose : undefined}></div>

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#DCE4F0] p-6 z-10 animate-in fade-in max-h-[90vh] overflow-y-auto admin-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#EFF4FF]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#003EC3]">
                #{item.type === 'LOST' ? 'LST' : 'FND'}-{item._id?.slice(-4)?.toUpperCase()}
              </span>
              <StatusBadge status={item.type} type="type" />
              <StatusBadge status={item.status} />
            </div>
            <h3 className="text-base font-bold text-[#0B1C30] mt-1">{item.title}</h3>
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

        {/* Item Photos */}
        {item.images && item.images.length > 0 && (
          <div className="mt-4">
            <span className="text-xs font-semibold text-[#434655] uppercase tracking-wider">Uploaded Evidence Images</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {item.images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-[#EFF4FF] border border-[#DCE4F0]">
                  <img
                    src={typeof img === 'string' ? img : img.url}
                    alt={`Item view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Item Details */}
        <div className="mt-4 space-y-2 text-xs text-[#434655]">
          <div className="p-3 bg-[#EFF4FF] rounded-xl border border-[#DCE4F0] space-y-1.5">
            <div>
              <span className="font-semibold text-[#0B1C30]">Description: </span>
              <span>{item.description}</span>
            </div>
            {item.location && (
              <div>
                <span className="font-semibold text-[#0B1C30]">Location: </span>
                <span>
                  {item.location.address ? `${item.location.address}, ` : ''}
                  {item.location.city || ''} {item.location.state ? `(${item.location.state})` : ''}
                </span>
              </div>
            )}
            <div>
              <span className="font-semibold text-[#0B1C30]">Date Incident: </span>
              <span>{item.itemDate ? new Date(item.itemDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            {item.reportedBy && (
              <div>
                <span className="font-semibold text-[#0B1C30]">Reported By: </span>
                <span>{item.reportedBy.name} ({item.reportedBy.email})</span>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Form Input Mode */}
        {isRejectingMode ? (
          <form onSubmit={handleReject} className="mt-4 pt-4 border-t border-[#EFF4FF]">
            <label className="block text-xs font-bold text-[#BA1A1A] mb-1">
              Rejection Reason (Required for Submitter):
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Insufficient identification details provided, or duplicate submission detected."
              className="w-full p-2.5 rounded-lg border border-[#DCE4F0] text-xs text-[#0B1C30] focus:ring-2 focus:ring-[#BA1A1A]/20 focus:outline-none"
            ></textarea>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRejectingMode(false)}
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
          /* Normal Actions Footer */
          <div className="mt-6 pt-4 border-t border-[#EFF4FF] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsRejectingMode(true)}
              disabled={loading || item.status === 'REJECTED' || item.status === 'RESOLVED'}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#BA1A1A] hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-40"
            >
              Reject Report
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
                disabled={loading || item.status === 'APPROVED' || item.status === 'RESOLVED'}
                onClick={handleApprove}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#003EC3] hover:bg-[#2457E8] shadow-xs flex items-center gap-2 disabled:opacity-40"
              >
                {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                <span>Approve & Publish</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemReviewModal;
