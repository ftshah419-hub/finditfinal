import React, { useState } from 'react';
import userApi from '../services/userApi';
import { useAuth } from '../../../context/AuthContext';

export const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await userApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        profileImage: profileImage.trim()
      });

      if (response.data?.user) {
        // Update context user if supported
        if (typeof setUser === 'function') {
          setUser(response.data.user);
        }
      }
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30 flex flex-col">
        {/* Header */}
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
            </div>
            <div>
              <h2 className="font-title-md text-title-md font-bold text-on-surface">Member Profile & Settings</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Identity Audit Level 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-space-md">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-error-container/60 border border-error/20 text-error text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMsg}
            </div>
          )}

          {/* Email (Read Only) */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
              Institutional Email (Read-Only)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="h-10 px-3.5 rounded-lg bg-surface-container-high/60 text-on-surface-variant font-body-md text-body-md border border-outline-variant/30 cursor-not-allowed opacity-80"
            />
            <span className="text-[11px] text-on-surface-variant">
              To update your registered email, contact campus security desk.
            </span>
          </div>

          {/* Assigned Role */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
              System Role
            </label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-primary-fixed text-on-primary-fixed border border-primary/20">
                {user?.role || 'USER'}
              </span>
              <span className="text-xs text-on-surface-variant">Role permissions are locked server-side.</span>
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 px-3.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Contact Phone */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface">Contact Phone</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 px-3.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Profile Image URL */}
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface">Profile Avatar URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              className="h-10 px-3.5 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;
