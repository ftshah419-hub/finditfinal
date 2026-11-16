import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import CategoryForm from '../components/CategoryForm';

/**
 * CategoryManagement Page
 * Classification Taxonomy & Category Management
 * Follows Category.js model and safe deactivation rules
 */
export const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await adminApi.getCategories();
      setCategories(list || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSave = async (formData) => {
    if (selectedCategory) {
      await adminApi.updateCategory(selectedCategory._id, formData);
    } else {
      await adminApi.createCategory(formData);
    }
    fetchCategories();
  };

  const handleToggleActive = async (category) => {
    await adminApi.updateCategory(category._id, {
      name: category.name,
      isActive: !category.isActive
    });
    fetchCategories();
  };

  const columns = [
    {
      key: 'name',
      label: 'Classification Name',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EFF4FF] text-[#003EC3] flex items-center justify-center font-bold text-xs border border-[#DCE4F0]">
            #
          </div>
          <div>
            <span className="font-bold text-sm text-[#0B1C30]">{c.name}</span>
            <span className="text-xs text-[#434655] block line-clamp-1">{c.description || 'No description'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Associated Items',
      render: (c) => (
        <span className="font-mono text-xs font-semibold text-[#003EC3] bg-[#EFF4FF] px-2.5 py-1 rounded-full border border-[#DCE4F0]">
          {c.itemCount !== undefined ? c.itemCount : 0} Items
        </span>
      )
    },
    {
      key: 'createdBy',
      label: 'Created By',
      render: (c) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[#0B1C30]">{c.createdBy?.name || 'Admin'}</span>
          <span className="text-[11px] text-[#434655]">{c.createdBy?.email || ''}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Active State',
      render: (c) => <StatusBadge status={c.isActive} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => {
              setSelectedCategory(c);
              setIsFormOpen(true);
            }}
            className="px-3 py-1 rounded-lg bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleToggleActive(c)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              c.isActive
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            {c.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1C30] tracking-tight">
            Inventory Classification Taxonomy
          </h1>
          <p className="text-xs text-[#434655] mt-1">
            Maintain normalized categories for campus-wide lost and found filings. Deactivate rather than delete categories associated with existing items.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-[#003EC3] hover:bg-[#2457E8] text-white text-xs font-semibold shadow-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create New Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Categories DataTable */}
      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        emptyMessage="No classification categories currently exist. Create the first one above."
      />

      {/* Category Create/Edit Form Modal */}
      <CategoryForm
        isOpen={isFormOpen}
        category={selectedCategory}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default CategoryManagement;
