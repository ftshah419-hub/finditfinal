import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

/**
 * ReportManagement Page
 * Incident Complaints & Platform Safety Moderation
 * Strictly adheres to Report.js schema and business rules
 */
export const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Review Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('RESOLVED');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 12,
        status: statusFilter || undefined,
        search: search.trim() || undefined
      };
      const result = await adminApi.getReports(params);
      setReports(result.reports || []);
      setPagination(result.pagination || { page: 1, limit: 12, total: 0, pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to retrieve complaint reports.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSubmitting(true);
    try {
      await adminApi.reviewReport(selectedReport._id, {
        status: reviewStatus,
        adminNote: adminNote.trim() || undefined
      });
      setSelectedReport(null);
      setAdminNote('');
      fetchReports(pagination.page);
    } catch (err) {
      alert(err.message || 'Failed to submit report review.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Report #ID',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-[#003EC3]">
          #REP-{r._id?.slice(-4)?.toUpperCase()}
        </span>
      )
    },
    {
      key: 'reason',
      label: 'Incident Reason & Subject',
      render: (r) => (
        <div className="flex flex-col min-w-0 max-w-xs">
          <span className="font-bold text-xs text-[#0B1C30] truncate">{r.reason}</span>
          <span className="text-[11px] text-[#434655] truncate block">
            {r.itemId ? `Item: ${r.itemId.title}` : r.reportedUserId ? `User: ${r.reportedUserId.name}` : 'General Platform'}
          </span>
        </div>
      )
    },
    {
      key: 'reporter',
      label: 'Filed By',
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[#0B1C30]">{r.reporterId?.name || 'Anonymous'}</span>
          <span className="text-[11px] text-[#434655]">{r.reporterId?.email || ''}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Submission Date',
      render: (r) => (
        <span className="font-mono text-xs text-[#434655]">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Moderation Status',
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (r) => (
        <button
          onClick={() => {
            setSelectedReport(r);
            setReviewStatus(r.status === 'PENDING' ? 'UNDER_REVIEW' : r.status);
            setAdminNote(r.adminNote || '');
          }}
          className="px-3 py-1 rounded-lg bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold transition-colors"
        >
          Review Complaint
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1C30] tracking-tight">
            Incident Complaints & Safety Moderation
          </h1>
          <p className="text-xs text-[#434655] mt-1">
            Review community flags regarding fraudulent claims, disputed listings, or conduct violations.
          </p>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE4F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:flex-1">
          <svg className="w-4 h-4 absolute left-3 top-3 text-[#434655]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reasons or descriptions..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#0B1C30] placeholder:text-[#434655] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003EC3]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-medium text-[#0B1C30] appearance-none cursor-pointer focus:bg-white focus:outline-none"
          >
            <option value="">Status: All Complaints</option>
            <option value="PENDING">Pending Review</option>
            <option value="UNDER_REVIEW">Under Active Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          {(search || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
              }}
              className="h-10 px-3 rounded-lg bg-[#EFF4FF] text-[#BA1A1A] text-xs font-semibold"
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

      {/* Reports DataTable */}
      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchReports(p)}
        emptyMessage="No complaint reports found matching current scope."
      />

      {/* Review Complaint Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => !submitting && setSelectedReport(null)}></div>

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#DCE4F0] p-6 z-10 animate-in fade-in">
            <div className="flex items-start justify-between pb-3 border-b border-[#EFF4FF]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#003EC3]">
                    #REP-{selectedReport._id?.slice(-4)?.toUpperCase()}
                  </span>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <h3 className="text-base font-bold text-[#0B1C30] mt-1">{selectedReport.reason}</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-[#434655] hover:bg-[#EFF4FF]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 p-3 bg-[#EFF4FF] rounded-xl text-xs space-y-1">
              <div>
                <span className="font-semibold text-[#0B1C30]">Reporter: </span>
                <span>{selectedReport.reporterId?.name} ({selectedReport.reporterId?.email})</span>
              </div>
              {selectedReport.itemId && (
                <div>
                  <span className="font-semibold text-[#0B1C30]">Target Item: </span>
                  <span>{selectedReport.itemId.title} (#{selectedReport.itemId._id?.slice(-4)})</span>
                </div>
              )}
              {selectedReport.reportedUserId && (
                <div>
                  <span className="font-semibold text-[#0B1C30]">Reported User: </span>
                  <span>{selectedReport.reportedUserId.name} ({selectedReport.reportedUserId.email})</span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold text-[#434655] uppercase block mb-1">
                Detailed Complaint Narrative
              </span>
              <p className="text-xs text-[#0B1C30] leading-relaxed bg-[#EFF4FF]/60 p-3 rounded-xl border border-[#DCE4F0] whitespace-pre-wrap">
                {selectedReport.description}
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3 pt-3 border-t border-[#EFF4FF]">
              <div>
                <label className="block text-xs font-bold text-[#0B1C30] mb-1">
                  Resolution Decision
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-medium text-[#0B1C30]"
                >
                  <option value="UNDER_REVIEW">Mark as Under Active Review</option>
                  <option value="RESOLVED">Resolve Complaint (Action Taken)</option>
                  <option value="DISMISSED">Dismiss Complaint (Unsubstantiated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1C30] mb-1">
                  Admin Internal Decision Note
                </label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Summarize the investigation or action taken..."
                  className="w-full p-2.5 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#0B1C30] focus:bg-white focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#434655] hover:bg-[#EFF4FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#003EC3] hover:bg-[#2457E8] shadow-xs flex items-center gap-2"
                >
                  {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  <span>Submit Moderation Ruling</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
