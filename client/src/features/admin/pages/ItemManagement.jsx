import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ItemReviewModal from '../components/ItemReviewModal';

/**
 * ItemManagement Page
 * Unified Lost and Found Property Intake & Moderation Center
 * Directly conforms to 11_admin_lost_report_management and 12_admin_found_report_management
 */
export const ItemManagement = ({ initialType = '', onSelectItem }) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [typeFilter, setTypeFilter] = useState(initialType || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);

  // Review Modal State
  const [reviewingItem, setReviewingItem] = useState(null);

  useEffect(() => {
    if (initialType !== undefined) {
      setTypeFilter(initialType);
    }
  }, [initialType]);

  // Load category list for dropdown filter
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catList = await adminApi.getCategories();
        setCategories(catList || []);
      } catch {
        // Fallback without categories
      }
    };
    loadCategories();
  }, []);

  const fetchItems = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 15,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        categoryId: categoryFilter || undefined,
        search: search.trim() || undefined
      };
      const result = await adminApi.getItems(params);
      setItems(result.items || []);
      setPagination(result.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to retrieve item reports.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchItems(1);
  }, [fetchItems]);

  const handleApprove = async (itemId) => {
    await adminApi.approveItem(itemId);
    fetchItems(pagination.page);
  };

  const handleReject = async (itemId, rejectionReason) => {
    await adminApi.rejectItem(itemId, rejectionReason);
    fetchItems(pagination.page);
  };

  const pendingCount = items.filter((i) => i.status === 'PENDING').length;
  const approvedCount = items.filter((i) => i.status === 'APPROVED').length;
  const resolvedCount = items.filter((i) => i.status === 'RESOLVED').length;

  const columns = [
    {
      key: 'item',
      label: 'Property Item',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#EFF4FF] overflow-hidden border border-[#DCE4F0] shrink-0">
            {item.images && item.images[0] ? (
              <img
                src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#434655]">
                <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 max-w-xs">
            <span
              onClick={() => onSelectItem && onSelectItem(item._id)}
              className="font-bold text-sm text-[#0B1C30] hover:text-[#003EC3] transition-colors truncate block cursor-pointer"
            >
              {item.title}
            </span>
            <span className="text-xs text-[#434655] truncate block">
              {item.categoryId?.name || 'General Item'} · {item.description}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type & Tag',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={item.type} type="type" />
          <span className="font-mono text-[11px] text-[#434655]">
            #{item.type === 'LOST' ? 'LST' : 'FND'}-{item._id?.slice(-4)?.toUpperCase()}
          </span>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location & Date',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#0B1C30]">
            {item.location?.city || item.location?.address || 'Campus Hub'}
          </span>
          <span className="text-[11px] text-[#434655]">
            {item.itemDate ? new Date(item.itemDate).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'reporter',
      label: 'Reported By',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[#0B1C30]">
            {item.reportedBy?.name || 'Anonymous User'}
          </span>
          <span className="text-[11px] text-[#434655]">
            {item.reportedBy?.email || ''}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Moderation Status',
      render: (item) => <StatusBadge status={item.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => onSelectItem && onSelectItem(item._id)}
            className="px-2.5 py-1 rounded-lg bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold transition-colors"
          >
            Inspect
          </button>
          {item.status === 'PENDING' ? (
            <button
              onClick={() => setReviewingItem(item)}
              className="px-2.5 py-1 rounded-lg bg-[#003EC3] hover:bg-[#2457E8] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Review
            </button>
          ) : (
            <button
              onClick={() => setReviewingItem(item)}
              className="px-2 py-1 rounded-lg text-xs font-medium text-[#434655] hover:bg-[#EFF4FF]"
            >
              Details
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Scope Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1C30] tracking-tight">
            {typeFilter === 'LOST'
              ? 'Lost Property Reports & Case Dossiers'
              : typeFilter === 'FOUND'
              ? 'Found Property Custody & Depot Intake'
              : 'Property Reports & Moderation Center'}
          </h1>
          <p className="text-xs text-[#434655] mt-1">
            Review submitted lost and found claims, approve publicly visible items, and assign custody depots.
          </p>
        </div>

        {/* Type Toggle Pills */}
        <div className="flex items-center bg-[#EFF4FF] p-1 rounded-xl self-start sm:self-auto border border-[#DCE4F0]">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === '' ? 'bg-white text-[#003EC3] shadow-xs' : 'text-[#434655] hover:text-[#0B1C30]'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setTypeFilter('LOST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'LOST' ? 'bg-white text-[#003EC3] shadow-xs' : 'text-[#434655] hover:text-[#0B1C30]'
            }`}
          >
            Lost Property
          </button>
          <button
            onClick={() => setTypeFilter('FOUND')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'FOUND' ? 'bg-white text-[#003EC3] shadow-xs' : 'text-[#434655] hover:text-[#0B1C30]'
            }`}
          >
            Found Custody
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#DCE4F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#434655] uppercase">Total Listed Reports</span>
          <div className="text-xl font-bold text-[#0B1C30] mt-0.5">{pagination.total}</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#DCE4F0] shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase">Pending Moderation</span>
          <div className="text-xl font-bold text-amber-700 mt-0.5">{pendingCount}</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#DCE4F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#003EC3] uppercase">Approved & Public</span>
          <div className="text-xl font-bold text-[#003EC3] mt-0.5">{approvedCount}</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#DCE4F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#16845B] uppercase">Resolved & Handed Off</span>
          <div className="text-xl font-bold text-[#16845B] mt-0.5">{resolvedCount}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <svg className="w-4 h-4 absolute left-3 top-3 text-[#434655]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, city or description..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#0B1C30] placeholder:text-[#434655] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003EC3]/20"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-medium text-[#0B1C30] appearance-none cursor-pointer focus:bg-white focus:outline-none"
          >
            <option value="">Category: All</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-medium text-[#0B1C30] appearance-none cursor-pointer focus:bg-white focus:outline-none"
          >
            <option value="">Status: All</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved / Public</option>
            <option value="REJECTED">Rejected</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {(search || categoryFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                setStatusFilter('');
              }}
              title="Reset Filters"
              className="h-10 px-3 rounded-lg bg-[#EFF4FF] hover:bg-[#DCE9FF] text-[#BA1A1A] text-xs font-semibold transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Items DataTable */}
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchItems(p)}
        emptyMessage="No property reports found for this scope."
      />

      {/* Item Review Modal */}
      <ItemReviewModal
        isOpen={Boolean(reviewingItem)}
        item={reviewingItem}
        onClose={() => setReviewingItem(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default ItemManagement;
