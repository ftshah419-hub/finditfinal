import React, { useState, useEffect } from 'react';
import userApi from '../services/userApi';

export const MyReportsView = ({ onNavigate, onViewItem, onClaimItem }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'lost', 'found'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Edit State Modal
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'lost') params.type = 'LOST';
      if (activeTab === 'found') params.type = 'FOUND';
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await userApi.getMyItems(params);
      if (res.data?.items) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to load user reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [activeTab, statusFilter]);

  const handleDelete = async (itemId, title) => {
    if (!window.confirm(`Are you sure you want to delete your report for "${title}"?`)) {
      return;
    }

    try {
      await userApi.deleteItem(itemId);
      setActionSuccess(`Report "${title}" was successfully deleted.`);
      setItems((prev) => prev.filter((i) => i._id !== itemId));
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to delete report.');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditAddress(item.location?.address || '');
    setEditCity(item.location?.city || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setSavingEdit(true);
    try {
      const res = await userApi.updateItem(editingItem._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        location: {
          address: editAddress.trim(),
          city: editCity.trim(),
          state: editingItem.location?.state || 'Campus State'
        }
      });

      const updated = res.data?.item || res.data;
      setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      setActionSuccess(
        `Report "${updated.title}" updated. ${
          editingItem.status === 'APPROVED' ? 'Status returned to PENDING for administrative re-review.' : ''
        }`
      );
      setEditingItem(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to update report.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Filter items by client search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.location?.address?.toLowerCase().includes(q) ||
      item.location?.city?.toLowerCase().includes(q) ||
      item._id?.toLowerCase().includes(q)
    );
  });

  const totalSubmissions = items.length;
  const lostCount = items.filter((i) => i.type === 'LOST').length;
  const foundCount = items.filter((i) => i.type === 'FOUND').length;
  const pendingCount = items.filter((i) => i.status === 'PENDING').length;
  const resolvedCount = items.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="flex flex-col w-full gap-space-xl pb-space-2xl">
      {/* Top Banner & Quick Stat Strip */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-space-xl shadow-sm border border-outline-variant/30">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wider mb-space-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              Report Central
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">My Reports</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
              Track, update, and manage your reported lost belongings and discovered items across campus nodes.
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('report-lost-item')}
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-error font-label-lg text-label-lg shadow-sm hover:bg-error-container/40 transition-colors cursor-pointer border border-error/20"
            >
              <span className="material-symbols-outlined text-[18px]">emergency_home</span>
              <span>Report Lost Item</span>
            </button>
            <button
              onClick={() => onNavigate('report-found-item')}
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Log Found Item</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mt-space-xl pt-space-md border-t border-outline-variant/30">
          <div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20">
            <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">format_list_bulleted</span>
            </div>
            <div>
              <span className="font-headline-md text-headline-md text-on-surface block leading-none font-bold">
                {totalSubmissions}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Total Submissions</span>
            </div>
          </div>

          <div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20">
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">radar</span>
            </div>
            <div>
              <span className="font-headline-md text-headline-md text-on-surface block leading-none font-bold">
                {lostCount}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Lost Reports</span>
            </div>
          </div>

          <div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[22px]">hourglass_top</span>
            </div>
            <div>
              <span className="font-headline-md text-headline-md text-on-surface block leading-none font-bold">
                {pendingCount}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">In Review / Pending</span>
            </div>
          </div>

          <div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <span className="font-headline-md text-headline-md text-on-surface block leading-none font-bold">
                {resolvedCount}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Resolved / Handed Off</span>
            </div>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-label-md flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 font-label-md flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-600">error</span>
          <span>{actionError}</span>
        </div>
      )}

      {/* Interactive Controls Section */}
      <div className="flex flex-col gap-space-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          {/* Segmented Tab Switcher */}
          <div className="inline-flex p-1 bg-surface-container-high rounded-xl self-start border border-outline-variant/30">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-space-xs cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>All Reports</span>
              <span className="px-1.5 py-0.5 rounded-full text-label-sm font-code-tabular bg-primary-fixed text-on-primary-fixed">
                {totalSubmissions}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('lost')}
              className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-space-xs cursor-pointer ${
                activeTab === 'lost'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Lost Reports</span>
              <span className="px-1.5 py-0.5 rounded-full text-label-sm font-code-tabular bg-surface-container text-on-surface-variant">
                {lostCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('found')}
              className={`px-space-md py-2 rounded-lg font-label-lg text-label-lg transition-all flex items-center gap-space-xs cursor-pointer ${
                activeTab === 'found'
                  ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Found Reports</span>
              <span className="px-1.5 py-0.5 rounded-full text-label-sm font-code-tabular bg-surface-container text-on-surface-variant">
                {foundCount}
              </span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30">
          <div className="md:col-span-8 relative flex items-center">
            <span className="material-symbols-outlined absolute left-space-md text-outline text-[20px]">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter your reports by title, ID, campus spot..."
              className="w-full h-10 pl-11 pr-space-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-transparent"
            />
          </div>

          <div className="md:col-span-4 relative flex items-center">
            <span className="material-symbols-outlined absolute left-space-md text-outline text-[18px]">filter_alt</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 pl-10 pr-space-lg rounded-lg bg-surface-container-low text-on-surface font-label-lg text-label-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending Administrative Review</option>
              <option value="APPROVED">Approved & Publicly Visible</option>
              <option value="REJECTED">Rejected by Reviewer</option>
              <option value="RESOLVED">Resolved & Recovered</option>
            </select>
            <span className="material-symbols-outlined absolute right-space-md text-outline pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl p-12 text-center border border-outline-variant/30 flex flex-col items-center">
          <span className="material-symbols-outlined text-[42px] text-outline-variant mb-2">inventory_2</span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">No Reports Found</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mt-1">
            You currently have no reports matching this filter view.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-md">
          {filteredItems.map((item) => {
            const isFound = item.type === 'FOUND';
            const shortId = `#FID-${item._id.slice(-4).toUpperCase()}`;
            return (
              <div
                key={item._id}
                className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-space-md hover:shadow-md transition-shadow"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start gap-space-md flex-1 min-w-0">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20">
                    <img
                      src={
                        item.images?.[0]?.url ||
                        (isFound
                          ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=200&q=80'
                          : 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80')
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase ${
                          isFound ? 'bg-[#16845B]' : 'bg-[#ba1a1a]'
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-code-tabular text-label-sm font-semibold text-primary px-1.5 py-0.5 rounded bg-primary-fixed/50">
                        {shortId}
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {item.categoryId?.name || 'General Item'}
                      </span>
                      <span className="text-on-surface-variant text-xs">•</span>
                      <span className="text-xs text-on-surface-variant font-code-tabular">
                        {new Date(item.itemDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h3
                      onClick={() => onViewItem(item)}
                      className="font-title-md text-title-md font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer truncate mt-0.5"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">pin_drop</span>
                      <span className="truncate">
                        {item.location?.address}, {item.location?.city}
                      </span>
                    </div>

                    {/* Rejection reason banner */}
                    {item.status === 'REJECTED' && item.rejectionReason && (
                      <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-rose-600">cancel</span>
                        <span>Rejection reason: {item.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-space-sm border-t md:border-t-0 pt-2 md:pt-0 border-surface-container shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === 'RESOLVED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewItem(item)}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>

                    {item.status !== 'RESOLVED' && (
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-secondary transition-colors cursor-pointer"
                        title="Edit Report"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    )}

                    {item.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-colors cursor-pointer"
                        title="Delete Report"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
              <div>
                <h3 className="font-title-md text-title-md font-bold text-on-surface">Edit Item Report</h3>
                <p className="text-xs text-on-surface-variant">
                  {editingItem.status === 'APPROVED' &&
                    'NOTE: Material edits to an approved report will return it to PENDING for re-review.'}
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded text-on-surface-variant hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Title *</label>
                <input
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Address *</label>
                  <input
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Zone / City *</label>
                  <input
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReportsView;
