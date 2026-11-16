import React from 'react';

/**
 * StatusBadge Component
 * Semantic, high-contrast status indicator adhering to FINDIT SaaS Design System
 */
export const StatusBadge = ({ status, type = 'status', className = '' }) => {
  if (status === undefined || status === null) return null;

  const normalized = String(status).toUpperCase();

  // Boolean active status
  if (typeof status === 'boolean' || normalized === 'TRUE' || normalized === 'ACTIVE') {
    const isActive = status === true || normalized === 'TRUE' || normalized === 'ACTIVE';
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-xs ${
          isActive
            ? 'bg-[#16845B]/15 text-[#16845B] border border-[#16845B]/30'
            : 'bg-red-50 text-red-700 border border-red-200'
        } ${className}`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#16845B]' : 'bg-red-600'}`}
        ></span>
        {isActive ? 'Active' : 'Deactivated'}
      </span>
    );
  }

  // Type Badges (LOST / FOUND)
  if (type === 'type' || normalized === 'LOST' || normalized === 'FOUND') {
    if (normalized === 'LOST') {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          LOST
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        FOUND
      </span>
    );
  }

  // Role Badges
  if (type === 'role' || normalized === 'ADMIN' || normalized === 'USER') {
    if (normalized === 'ADMIN') {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
          Superadmin
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
      >
        User
      </span>
    );
  }

  // Workflow Status Badges
  switch (normalized) {
    case 'APPROVED':
    case 'RESOLVED':
    case 'CONFIRMED':
    case 'SUCCESS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16845B]/15 text-[#16845B] border border-[#16845B]/30 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]"></span>
          {normalized === 'RESOLVED' ? 'Resolved & Reunited' : normalized}
        </span>
      );

    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
          Pending Review
        </span>
      );

    case 'UNDER_REVIEW':
    case 'REVIEWED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          Under Review
        </span>
      );

    case 'REJECTED':
    case 'DISMISSED':
    case 'SUSPENDED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          {normalized}
        </span>
      );

    case 'WITHDRAWN':
    case 'INACTIVE':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 ${className}`}
        >
          {normalized}
        </span>
      );
  }
};

export default StatusBadge;
