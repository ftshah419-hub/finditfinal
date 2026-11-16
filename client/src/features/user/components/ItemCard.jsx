import React from 'react';

export const ItemCard = ({ item, onViewDetails, onClaim, currentUser }) => {
  if (!item) return null;

  const isFound = item.type === 'FOUND';
  const isOwner = currentUser && item.reportedBy && (
    (typeof item.reportedBy === 'object' && item.reportedBy._id === currentUser._id) ||
    item.reportedBy === currentUser._id
  );
  const canClaim = isFound && item.status === 'APPROVED' && !isOwner;

  // Format date
  const formattedDate = item.itemDate
    ? new Date(item.itemDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  // Fallback image based on category/type
  const displayImage =
    item.images && item.images.length > 0 && item.images[0].url
      ? item.images[0].url
      : isFound
      ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80';

  const shortId = `#FID-${(item._id || '').slice(-4).toUpperCase()}`;

  return (
    <article className="group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-outline-variant/30">
      {/* Top Media Header */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-container-low">
        <img
          src={displayImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-2.5 left-2.5">
          {isFound ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold text-[#16845B] bg-emerald-50/90 backdrop-blur-md border border-emerald-200 shadow-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]"></span> FOUND
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold text-[#ba1a1a] bg-rose-50/90 backdrop-blur-md border border-rose-200 shadow-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span> LOST
            </span>
          )}
        </div>

        {/* Reference ID Pill */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-on-surface/80 backdrop-blur-md text-surface-bright font-code-tabular text-label-sm">
          {shortId}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-space-md flex-1 flex flex-col justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
            <span className="uppercase font-semibold tracking-wider text-secondary truncate max-w-[65%]">
              {item.categoryId?.name || 'General Item'}
            </span>
            <span className="font-code-tabular text-on-surface-variant shrink-0">{formattedDate}</span>
          </div>

          <h3
            onClick={() => onViewDetails && onViewDetails(item)}
            className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary transition-colors line-clamp-1 cursor-pointer"
          >
            {item.title}
          </h3>

          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
            {item.description}
          </p>
        </div>

        {/* Location & Actions */}
        <div className="flex flex-col gap-space-sm pt-space-xs border-t border-surface-container">
          <div className="flex items-center gap-1 text-label-sm font-label-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[16px] shrink-0">pin_drop</span>
            <span className="truncate">
              {item.location?.address
                ? `${item.location.address}${item.location.city ? `, ${item.location.city}` : ''}`
                : 'Campus Location'}
            </span>
          </div>

          <div className="flex items-center gap-space-sm pt-1">
            <button
              onClick={() => onViewDetails && onViewDetails(item)}
              className="flex-1 py-2 px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors text-center font-medium cursor-pointer"
            >
              View Details
            </button>

            {canClaim && (
              <button
                onClick={() => onClaim && onClaim(item)}
                className="py-2 px-space-md rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm font-medium cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Claim Item
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ItemCard;
