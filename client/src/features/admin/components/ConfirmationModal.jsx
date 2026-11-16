import React from 'react';

/**
 * ConfirmationModal Component
 * Accessible dialog for confirming sensitive administrative operations
 */
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Administrative Action',
  message = 'Are you sure you want to proceed with this operation?',
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDanger = false,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={!loading ? onClose : undefined}
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DCE4F0] p-6 z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-red-50 text-[#BA1A1A]' : 'bg-[#EFF4FF] text-[#003EC3]'
            }`}
          >
            {isDanger ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#0B1C30]">{title}</h3>
            <p className="text-xs text-[#434655] mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#EFF4FF] flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#434655] hover:bg-[#EFF4FF] transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 ${
              isDanger
                ? 'bg-[#BA1A1A] hover:bg-[#93000A]'
                : 'bg-[#003EC3] hover:bg-[#2457E8]'
            }`}
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
