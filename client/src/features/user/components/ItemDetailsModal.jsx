import React, { useState } from 'react';

export const ItemDetailsModal = ({ item, isOpen, onClose, onOpenClaim, currentUser }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !item) return null;

  const isFound = item.type === 'FOUND';
  const isOwner =
    currentUser &&
    item.reportedBy &&
    ((typeof item.reportedBy === 'object' && item.reportedBy._id === currentUser._id) ||
      item.reportedBy === currentUser._id);
  const canClaim = isFound && item.status === 'APPROVED' && !isOwner;

  const images =
    item.images && item.images.length > 0
      ? item.images.map((img) => img.url)
      : [
          isFound
            ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
        ];

  const formattedDate = item.itemDate
    ? new Date(item.itemDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  const shortId = `#FID-${(item._id || '').slice(-4).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-surface-container-low px-6 py-3.5 flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="font-code-tabular text-label-md px-2.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-semibold">
              {shortId}
            </span>
            <span className="text-on-surface-variant font-label-sm">•</span>
            <span className="font-label-md text-label-md text-secondary font-semibold uppercase tracking-wider">
              {item.categoryId?.name || 'General'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-space-lg">
          {/* Main Visual Display */}
          <div className="flex flex-col gap-2">
            <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/30">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={item.title}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3">
                {isFound ? (
                  <span className="px-3 py-1 rounded-full text-label-sm font-semibold bg-[#16845B] text-white shadow-md uppercase tracking-wider">
                    FOUND ITEM
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-label-sm font-semibold bg-[#ba1a1a] text-white shadow-md uppercase tracking-wider">
                    LOST PROPERTY
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail row if multiple images */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-primary shadow-sm' : 'border-outline-variant/40 opacity-70'
                    }`}
                  >
                    <img src={url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details Content */}
          <div className="flex flex-col gap-space-md">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {item.title}
                </h1>
                <span
                  className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold uppercase tracking-wider ${
                    item.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : item.status === 'RESOLVED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Status: {item.status}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Location & Meta Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-surface-container-low border border-surface-container-high">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">location_on</span>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">
                    {isFound ? 'Discovered At' : 'Last Seen At'}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                    {item.location?.address || 'Campus Hub'}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block">
                    {item.location?.city ? `${item.location.city}, ` : ''}{item.location?.state || ''}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">calendar_today</span>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">
                    Incident Date
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                    {formattedDate}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block">
                    Logged {new Date(item.createdAt || item.itemDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Shield Notice */}
            <div className="flex items-center gap-2 text-xs text-on-surface-variant px-1">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">shield</span>
              <span>Reporter identity protected by FINDIT Anonymization Protocol</span>
            </div>
          </div>

          {/* Action Strip */}
          <div className="flex items-center justify-end gap-space-sm pt-4 border-t border-surface-container-high">
            <button
              onClick={onClose}
              className="px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg transition-colors cursor-pointer"
            >
              Close
            </button>

            {canClaim && (
              <button
                onClick={() => {
                  onClose();
                  onOpenClaim(item);
                }}
                className="px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Claim This Property</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsModal;
