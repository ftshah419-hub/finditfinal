import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import StatusBadge from '../components/StatusBadge';
import UserStatusModal from '../components/UserStatusModal';

/**
 * UserDetails Page
 * In-depth administrative dossier for a specific user
 */
export const UserDetails = ({ userId, onBack, onSelectItem }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUserById(userId);
      setUser(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve user details.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  const handleStatusChange = async (targetId, nextStatus) => {
    await adminApi.updateUserStatus(targetId, nextStatus);
    fetchUserDetails();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#DCE4F0] p-12 text-center shadow-xs">
        <div className="inline-block w-8 h-8 border-3 border-[#003EC3]/20 border-t-[#003EC3] rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-[#434655] font-medium">Retrieving user dossier from database...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-white rounded-xl border border-[#DCE4F0] p-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-[#BA1A1A]">{error || 'User not found.'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold rounded-lg"
        >
          Return to User Directory
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button and Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003EC3] hover:underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to User Directory</span>
        </button>

        <button
          onClick={() => setShowStatusModal(true)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            user.isActive
              ? 'bg-red-50 hover:bg-red-100 text-[#BA1A1A] border border-red-200'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          {user.isActive ? 'Deactivate User Account' : 'Reactivate User Account'}
        </button>
      </div>

      {/* Main Identity Profile Card */}
      <div className="bg-white rounded-2xl border border-[#DCE4F0] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#003EC3] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#0B1C30]">{user.name}</h2>
              <StatusBadge status={user.role} type="role" />
              <StatusBadge status={user.isActive} />
            </div>
            <p className="text-xs text-[#434655] mt-1">{user.email}</p>
            {user.phone && <p className="text-xs text-[#434655]">Phone: {user.phone}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#434655] border-t md:border-t-0 md:border-l border-[#DCE4F0] pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <div>
            <span className="text-[11px] font-semibold uppercase block text-[#434655]">Database ID</span>
            <span className="font-mono text-xs font-bold text-[#0B1C30]">#{user._id}</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase block text-[#434655]">Joined On</span>
            <span className="font-mono text-xs text-[#0B1C30]">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase block text-[#434655]">Total Reports</span>
            <span className="font-mono text-xs font-bold text-[#003EC3]">{user.reportsCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Items Reported By This User */}
      <div className="bg-white rounded-2xl border border-[#DCE4F0] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#0B1C30] mb-4">
          Property Reports Submitted by {user.name}
        </h3>
        {user.recentItems && user.recentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user.recentItems.map((item) => (
              <div
                key={item._id}
                onClick={() => onSelectItem && onSelectItem(item._id)}
                className="p-3.5 rounded-xl bg-[#EFF4FF]/60 hover:bg-[#EFF4FF] border border-[#DCE4F0] transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.images && item.images[0] && (
                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-[#DCE4F0] shrink-0">
                      <img
                        src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0B1C30] truncate">{item.title}</p>
                    <p className="text-[11px] text-[#434655]">
                      {item.itemDate ? new Date(item.itemDate).toLocaleDateString() : ''} · {item.categoryId?.name || 'Item'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StatusBadge status={item.type} type="type" />
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#434655] italic">No item reports filed by this account.</p>
        )}
      </div>

      {/* Recent Claims Filed By This User */}
      <div className="bg-white rounded-2xl border border-[#DCE4F0] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#0B1C30] mb-4">
          Ownership Claims Filed by {user.name}
        </h3>
        {user.recentClaims && user.recentClaims.length > 0 ? (
          <div className="space-y-3">
            {user.recentClaims.map((claim) => (
              <div
                key={claim._id}
                className="p-4 rounded-xl bg-[#EFF4FF]/40 border border-[#DCE4F0] flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#003EC3]">
                      #CLM-{claim._id?.slice(-4)?.toUpperCase()}
                    </span>
                    <StatusBadge status={claim.status} />
                    <span className="text-[11px] text-[#434655]">
                      Filed: {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <p className="text-xs text-[#0B1C30] font-medium mt-1">
                    Target Found Item: <strong>{claim.itemId?.title || 'Found Property'}</strong>
                  </p>
                  <p className="text-xs text-[#434655] mt-0.5 line-clamp-1 italic">
                    Proof: "{claim.proofDescription}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#434655] italic">No ownership claims submitted by this account.</p>
        )}
      </div>

      {/* User Status Modal */}
      <UserStatusModal
        isOpen={showStatusModal}
        user={user}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusChange}
      />
    </div>
  );
};

export default UserDetails;
