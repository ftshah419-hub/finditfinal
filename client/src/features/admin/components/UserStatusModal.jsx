import React, { useState } from 'react';

/**
 * UserStatusModal Component
 * Dedicated modal for activating or deactivating a user account
 */
export const UserStatusModal = ({
  isOpen,
  user,
  onClose,
  onConfirm
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !user) return null;

  const nextStatus = !user.isActive;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onConfirm(user._id, nextStatus);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={!loading ? onClose : undefined}></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DCE4F0] p-6 z-10 animate-in fade-in">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              !nextStatus ? 'bg-red-50 text-[#BA1A1A]' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-[#0B1C30]">
              {nextStatus ? 'Reactivate User Account' : 'Deactivate User Account'}
            </h3>
            <p className="text-xs text-[#434655] mt-1">
              You are about to change the authorization status for <strong>{user.name}</strong> ({user.email}).
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="mt-4 p-3 rounded-xl bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#434655] space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">User Role:</span>
            <span className="font-semibold text-[#0B1C30]">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Current Status:</span>
            <span className={user.isActive ? 'text-[#16845B] font-semibold' : 'text-[#BA1A1A] font-semibold'}>
              {user.isActive ? 'Active' : 'Deactivated'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">New Status:</span>
            <span className={nextStatus ? 'text-[#16845B] font-bold' : 'text-[#BA1A1A] font-bold'}>
              {nextStatus ? 'Active' : 'Deactivated'}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#EFF4FF] flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#434655] hover:bg-[#EFF4FF]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-xs flex items-center gap-2 ${
              !nextStatus
                ? 'bg-[#BA1A1A] hover:bg-[#93000A]'
                : 'bg-[#16845B] hover:bg-emerald-800'
            }`}
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            <span>{nextStatus ? 'Confirm Activation' : 'Confirm Deactivation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserStatusModal;
