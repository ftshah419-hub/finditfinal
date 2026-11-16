import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';

/**
 * SystemSettings Page
 * System Operational Policies & Configuration Management
 * Conforms to SystemSetting.js schema and business rules (no secrets)
 */
export const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Edit State
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Default initial settings if collection is empty
  const defaultSettings = [
    { key: 'CLAIM_SLA_HOURS', value: '24', description: 'Maximum turnaround window before high-priority alert triggers' },
    { key: 'DEPOT_MAX_CAPACITY', value: '2500', description: 'Combined item threshold across campus physical storage vaults' },
    { key: 'AUTO_AI_MATCH_THRESHOLD', value: '85', description: 'Minimum cosine similarity score required for high-priority matching queue' },
    { key: 'UNCLAIMED_DISPOSITION_DAYS', value: '90', description: 'Statutory holding period before unclaimed property disposition' }
  ];

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await adminApi.getSettings();
      if (list && list.length > 0) {
        setSettings(list);
      } else {
        setSettings(defaultSettings);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve system settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleStartEdit = (setting) => {
    setEditingKey(setting.key);
    setEditValue(typeof setting.value === 'object' ? JSON.stringify(setting.value) : String(setting.value));
    setEditDescription(setting.description || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingKey) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await adminApi.updateSetting(editingKey, editValue, editDescription);
      setSuccessMessage(`Configuration key "${editingKey}" updated successfully.`);
      setEditingKey(null);
      fetchSettings();
    } catch (err) {
      setError(err.message || 'Failed to update system setting.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B1C30] tracking-tight">
          System Operational Policies & Configuration
        </h1>
        <p className="text-xs text-[#434655] mt-1">
          Adjust operational parameters, depot capacities, SLA timelines, and AI prediction thresholds. Sensitive environmental credentials (JWT secrets, Cloudinary secrets) remain immutable and protected.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Settings Grid */}
      <div className="bg-white rounded-2xl border border-[#DCE4F0] p-6 shadow-xs">
        <h2 className="text-base font-bold text-[#0B1C30] mb-4">
          Active Administrative Policy Variables
        </h2>

        {loading ? (
          <div className="py-12 text-center text-[#434655] text-xs">
            <div className="inline-block w-6 h-6 border-2 border-[#003EC3]/20 border-t-[#003EC3] rounded-full animate-spin"></div>
            <p className="mt-2">Reading configuration parameters...</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EFF4FF]">
            {settings.map((s) => {
              const isEditing = editingKey === s.key;
              return (
                <div key={s.key} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 max-w-lg">
                    <span className="font-mono text-xs font-bold text-[#003EC3] block">
                      {s.key}
                    </span>
                    <p className="text-xs text-[#434655] mt-0.5">
                      {s.description || 'Configured administrative system parameter'}
                    </p>
                    {s.updatedBy && (
                      <span className="text-[10px] text-[#434655] block mt-1">
                        Last modified by: {s.updatedBy.name || s.updatedBy.email}
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSave} className="flex items-center gap-2 w-full md:w-auto">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-9 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-mono font-bold text-[#0B1C30] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-3 py-1.5 bg-[#003EC3] hover:bg-[#2457E8] text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingKey(null)}
                        className="px-3 py-1.5 text-xs text-[#434655] hover:bg-[#EFF4FF] rounded-lg"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-3 py-1 bg-[#EFF4FF] rounded-lg border border-[#DCE4F0] text-[#0B1C30]">
                        {typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value)}
                      </span>
                      <button
                        onClick={() => handleStartEdit(s)}
                        className="px-3 py-1 rounded-lg bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold transition-colors"
                      >
                        Modify
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-xl bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#434655] space-y-1">
        <span className="font-bold text-[#0B1C30] block">Security Guardrail: Protected Environment Configuration</span>
        <p className="leading-relaxed text-[11px]">
          Cryptographic keys, database URIs, JWT session secrets, and Cloudinary API credentials are hardcoded to root environment boundaries (.env) and cannot be modified or inspected via administrative client APIs.
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;
