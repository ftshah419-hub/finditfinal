import React, { useState } from 'react';
import userApi from '../services/userApi';

export const SubmitClaimModal = ({ item, isOpen, onClose, onSuccess }) => {
  const [proofDescription, setProofDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !item) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + evidenceFiles.length > 5) {
      setError('You can upload a maximum of 5 evidence photos.');
      return;
    }

    const validFiles = [];
    const validPreviews = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 5 MB limit.`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    setEvidenceFiles((prev) => [...prev, ...validFiles]);
    setFilePreviews((prev) => [...prev, ...validPreviews]);
    setError(null);
  };

  const removeFile = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofDescription.trim() || proofDescription.trim().length < 10) {
      setError('Please provide at least 10 characters explaining your ownership proof.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('proofDescription', proofDescription.trim());

      evidenceFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await userApi.submitClaim(item._id, formData);
      if (onSuccess) {
        onSuccess(response.data?.claim || response.data);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit ownership claim. Please verify item eligibility.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/40 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <div>
              <h2 className="font-title-md text-title-md font-bold text-on-surface">Submit Ownership Claim</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Custody Case #{item._id.slice(-6).toUpperCase()} • {item.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-space-md">
          {error && (
            <div className="p-3.5 rounded-xl bg-error-container/60 border border-error/20 flex items-center gap-2 text-error font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Item Summary Banner */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden shrink-0">
              <img
                src={
                  item.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=200&q=80'
                }
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 uppercase">
                  FOUND ITEM
                </span>
                <span className="text-xs text-on-surface-variant">
                  Discovered {new Date(item.itemDate).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-title-md text-title-md font-semibold text-on-surface truncate mt-0.5">
                {item.title}
              </h3>
              <p className="text-xs text-on-surface-variant truncate">
                {item.location?.address}, {item.location?.city}
              </p>
            </div>
          </div>

          {/* Proof of Ownership Explanation */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md font-semibold text-on-surface flex items-center justify-between">
              <span>Proof of Ownership Description <span className="text-error">*</span></span>
              <span className="text-xs text-on-surface-variant font-normal">Min 10 characters</span>
            </label>
            <textarea
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              placeholder="Describe unique identifiers, markings, stickers, serial numbers, screen locks, or contents inside this item that only the rightful owner would know..."
              rows={4}
              required
              className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/40 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Photographic Evidence Attachment */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md font-semibold text-on-surface">
              Supporting Evidence Photos (Receipts, Past Photos, Serial Numbers)
            </label>
            <div className="p-4 rounded-xl border-2 border-dashed border-outline-variant/60 bg-surface-container-low flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span className="material-symbols-outlined text-[28px] text-primary mb-1">add_photo_alternate</span>
              <p className="font-label-md text-label-md text-on-surface font-semibold">
                Click or drag images to attach evidence
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Up to 5 images (JPG, PNG, WebP) max 5 MB each
              </p>
            </div>

            {/* Evidence Previews */}
            {filePreviews.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {filePreviews.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-outline-variant">
                    <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legal / Policy Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-body-sm text-body-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0 mt-0.5">info</span>
            <p>
              Filing a claim alerts the campus custody security desk. Your dossier will be evaluated against custody logs.
              False claims violate platform policies. Claims and AI matches do <strong>NOT</strong> prove ownership automatically.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-semibold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Submitting Dossier...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Submit Claim Dossier</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitClaimModal;
