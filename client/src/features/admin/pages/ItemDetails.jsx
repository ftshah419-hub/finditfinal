import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import StatusBadge from '../components/StatusBadge';
import ItemReviewModal from '../components/ItemReviewModal';

/**
 * ItemDetails Page
 * Comprehensive Case Dossier & Chain of Custody for an Item
 */
export const ItemDetails = ({ itemId, onBack, onSelectClaim }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const fetchItemDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getItemById(itemId);
      setItem(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve item details.');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (itemId) {
      fetchItemDetails();
    }
  }, [itemId, fetchItemDetails]);

  const handleApprove = async (id) => {
    await adminApi.approveItem(id);
    fetchItemDetails();
  };

  const handleReject = async (id, reason) => {
    await adminApi.rejectItem(id, reason);
    fetchItemDetails();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#DCE4F0] p-12 text-center shadow-xs">
        <div className="inline-block w-8 h-8 border-3 border-[#003EC3]/20 border-t-[#003EC3] rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-[#434655] font-medium">Retrieving item dossier from database...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="bg-white rounded-xl border border-[#DCE4F0] p-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-[#BA1A1A]">{error || 'Item dossier not found.'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold rounded-lg"
        >
          Return to Item Management
        </button>
      </div>
    );
  }

  const images = item.images || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003EC3] hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Property Inventory</span>
        </button>

        <div className="flex items-center gap-2">
          {item.status !== 'RESOLVED' && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 rounded-lg bg-[#003EC3] hover:bg-[#2457E8] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Moderation Actions
            </button>
          )}
        </div>
      </div>

      {/* Main Item Dossier Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE4F0] p-6 shadow-xs flex flex-col gap-4">
          <div className="w-full aspect-square rounded-xl bg-[#EFF4FF] border border-[#DCE4F0] overflow-hidden flex items-center justify-center">
            {images.length > 0 ? (
              <img
                src={typeof images[selectedImageIndex] === 'string' ? images[selectedImageIndex] : images[selectedImageIndex]?.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center text-[#434655]">
                <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs mt-2">No custody images provided</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-square rounded-lg border overflow-hidden ${
                    selectedImageIndex === idx
                      ? 'border-[#003EC3] ring-2 ring-[#003EC3]/30'
                      : 'border-[#DCE4F0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={typeof img === 'string' ? img : img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="p-3 bg-[#EFF4FF] rounded-xl text-xs text-[#434655] space-y-1">
            <div className="flex justify-between">
              <span>Database Reference:</span>
              <span className="font-mono font-bold text-[#0B1C30]">#{item._id}</span>
            </div>
            <div className="flex justify-between">
              <span>Category:</span>
              <span className="font-semibold text-[#0B1C30]">{item.categoryId?.name || 'General Item'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Custody Stream (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Identity & Status */}
          <div className="bg-white rounded-2xl border border-[#DCE4F0] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={item.type} type="type" />
              <StatusBadge status={item.status} />
              <span className="text-xs font-mono text-[#434655]">
                Intake: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-[#0B1C30]">{item.title}</h1>

            <div>
              <span className="text-xs font-semibold text-[#434655] uppercase block mb-1">
                Detailed Property Description
              </span>
              <p className="text-sm text-[#0B1C30] leading-relaxed whitespace-pre-wrap bg-[#EFF4FF]/60 p-4 rounded-xl border border-[#DCE4F0]">
                {item.description}
              </p>
            </div>

            {item.rejectionReason && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                <strong>Rejection Reason:</strong> {item.rejectionReason}
              </div>
            )}

            {/* Geographical Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#434655]">
              <div className="p-3 bg-[#EFF4FF] rounded-xl border border-[#DCE4F0]">
                <span className="font-semibold block text-[#0B1C30] mb-0.5">Custody Location</span>
                <span>{item.location?.address || 'Campus Grounds'}</span>
                <span className="block font-medium text-[#0B1C30]">
                  {item.location?.city || ''} {item.location?.state ? `(${item.location.state})` : ''}
                </span>
              </div>
              <div className="p-3 bg-[#EFF4FF] rounded-xl border border-[#DCE4F0]">
                <span className="font-semibold block text-[#0B1C30] mb-0.5">Incident Date</span>
                <span>{item.itemDate ? new Date(item.itemDate).toLocaleDateString() : 'Unspecified'}</span>
              </div>
            </div>

            {/* Submitter Dossier */}
            <div className="p-4 bg-[#EFF4FF]/60 rounded-xl border border-[#DCE4F0] text-xs">
              <span className="text-[11px] font-bold uppercase text-[#434655] block mb-2">
                Reporter Identity
              </span>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-bold text-sm text-[#0B1C30]">{item.reportedBy?.name || 'Anonymous User'}</span>
                  <span className="text-[#434655] block">{item.reportedBy?.email || 'No email provided'}</span>
                </div>
                {item.reportedBy?.phone && (
                  <span className="font-mono text-[#003EC3] bg-white px-2 py-1 rounded border border-[#DCE4F0]">
                    {item.reportedBy.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Admin Audit Stamp */}
            {item.reviewedBy && (
              <div className="pt-3 border-t border-[#EFF4FF] text-[11px] text-[#434655] flex items-center justify-between">
                <span>
                  Reviewed by Admin: <strong>{item.reviewedBy.name || item.reviewedBy.email}</strong>
                </span>
                <span>
                  {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : ''}
                </span>
              </div>
            )}
          </div>

          {/* Claims Associated with this Item */}
          {item.type === 'FOUND' && (
            <div className="bg-white rounded-2xl border border-[#DCE4F0] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#0B1C30]">
                  Ownership Claims Filed on this Custody Item
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold">
                  {item.claims?.length || 0} Claim(s)
                </span>
              </div>

              {item.claims && item.claims.length > 0 ? (
                <div className="space-y-3">
                  {item.claims.map((clm) => (
                    <div
                      key={clm._id}
                      className="p-4 rounded-xl bg-[#EFF4FF]/50 border border-[#DCE4F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#003EC3]">
                            #CLM-{clm._id?.slice(-4)?.toUpperCase()}
                          </span>
                          <StatusBadge status={clm.status} />
                        </div>
                        <p className="font-bold text-[#0B1C30] mt-1">
                          Claimant: {clm.claimantId?.name} ({clm.claimantId?.email})
                        </p>
                        <p className="text-[#434655] mt-0.5 italic line-clamp-1">
                          "{clm.proofDescription}"
                        </p>
                      </div>

                      {onSelectClaim && (
                        <button
                          onClick={() => onSelectClaim(clm._id)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE4F0] text-[#003EC3] font-semibold hover:bg-[#EFF4FF] transition-colors shrink-0"
                        >
                          Verify Claim
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#434655] italic">
                  No ownership claims have been submitted for this found property yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ItemReviewModal
        isOpen={showReviewModal}
        item={item}
        onClose={() => setShowReviewModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ItemDetails;
