import React, { useState, useEffect } from 'react';

/**
 * CategoryForm Component
 * Modal form for creating and updating inventory classification categories
 */
export const CategoryForm = ({
  isOpen,
  category = null,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setIsActive(category.isActive !== undefined ? category.isActive : true);
    } else {
      setName('');
      setDescription('');
      setIsActive(true);
    }
    setError(null);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        isActive
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={!loading ? onClose : undefined}></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#DCE4F0] p-6 z-10 animate-in fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFF4FF]">
          <h3 className="text-base font-bold text-[#0B1C30]">
            {category ? 'Edit Category' : 'Create New Inventory Category'}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-[#434655] hover:bg-[#EFF4FF]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#0B1C30] mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laptops & Portable Tech"
              className="w-full h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#0B1C30] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003EC3]/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#0B1C30] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Classification scope, handling requirements or storage guidelines..."
              className="w-full p-2.5 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#0B1C30] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003EC3]/20"
            ></textarea>
          </div>

          {category && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#EFF4FF] border border-[#DCE4F0]">
              <div>
                <span className="font-bold text-[#0B1C30] block">Active Classification Status</span>
                <span className="text-[#434655] text-[11px]">
                  Inactive categories are hidden from new incident reports.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#003EC3] focus:ring-[#003EC3]/30 cursor-pointer"
              />
            </div>
          )}

          <div className="pt-3 border-t border-[#EFF4FF] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#434655] hover:bg-[#EFF4FF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#003EC3] hover:bg-[#2457E8] shadow-xs flex items-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              <span>{category ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
