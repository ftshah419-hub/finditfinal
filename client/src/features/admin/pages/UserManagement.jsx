import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import UserStatusModal from '../components/UserStatusModal';

/**
 * UserManagement Page
 * User Directory & Access Control
 * Directly conforms to 10_admin_user_management
 */
export const UserManagement = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Status Modal State
  const [selectedUserForStatus, setSelectedUserForStatus] = useState(null);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter !== '' ? statusFilter : undefined
      };
      const result = await adminApi.getUsers(params);
      setUsers(result.users || []);
      setPagination(result.pagination || { page: 1, limit: 15, total: 0, pages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to retrieve user directory.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleStatusChange = async (userId, nextStatus) => {
    await adminApi.updateUserStatus(userId, nextStatus);
    fetchUsers(pagination.page);
  };

  const handleExportCSV = () => {
    if (!users.length) return;
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Joined Date'];
    const rows = users.map((u) => [
      u._id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.isActive ? 'Active' : 'Deactivated',
      u.createdAt ? new Date(u.createdAt).toISOString() : ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FINDIT_User_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeCount = users.filter((u) => u.isActive).length;
  const deactivatedCount = users.filter((u) => !u.isActive).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;

  const columns = [
    {
      key: 'identity',
      label: 'User Identity',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E5EEFF] text-[#003EC3] flex items-center justify-center font-bold text-xs shrink-0 border border-[#DCE4F0]">
            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <span
              onClick={() => onSelectUser && onSelectUser(u._id)}
              className="font-bold text-sm text-[#0B1C30] hover:text-[#003EC3] transition-colors truncate block cursor-pointer"
            >
              {u.name}
            </span>
            <span className="text-xs text-[#434655]">
              {u.role === 'ADMIN' ? 'Administrator' : 'Collegiate Member'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Campus ID / Email',
      render: (u) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold text-[#0B1C30]">
            #{u._id?.slice(-6)?.toUpperCase()}
          </span>
          <span className="text-xs text-[#434655]">{u.email}</span>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role & Custody',
      render: (u) => <StatusBadge status={u.role} type="role" />
    },
    {
      key: 'createdAt',
      label: 'Joined Date',
      render: (u) => (
        <span className="font-mono text-xs text-[#434655]">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      key: 'reports',
      label: 'Total Reports',
      render: (u) => {
        const rep = u.reportsSummary || { lost: 0, found: 0, total: 0 };
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {rep.lost || 0} Lost
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              {rep.found || 0} Found
            </span>
          </div>
        );
      }
    },
    {
      key: 'claims',
      label: 'Claims Filed',
      render: (u) => (
        <span className="font-mono text-xs text-[#0B1C30]">
          {u.claimsCount || 0} Claims
        </span>
      )
    },
    {
      key: 'status',
      label: 'Account Status',
      render: (u) => <StatusBadge status={u.isActive} />
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => onSelectUser && onSelectUser(u._id)}
            className="px-2.5 py-1 rounded-lg bg-[#EFF4FF] hover:bg-[#E5EEFF] text-[#003EC3] text-xs font-semibold transition-colors"
          >
            View Dossier
          </button>
          <button
            onClick={() => setSelectedUserForStatus(u)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              u.isActive
                ? 'bg-red-50 hover:bg-red-100 text-[#BA1A1A]'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
            }`}
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Stat Ribbons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1C30] tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-xs text-[#434655] mt-1">
            Authorize student, staff, and custodial roles across the FINDIT network.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!users.length}
          className="px-4 py-2 rounded-lg bg-white border border-[#DCE4F0] text-[#0B1C30] hover:bg-[#EFF4FF] text-xs font-semibold transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4 text-[#005AC4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export Directory (CSV)</span>
        </button>
      </div>

      {/* Mini Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#DCE4F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#434655] uppercase">Total Listed Users</span>
          <div className="text-xl font-bold text-[#0B1C30] mt-0.5">{pagination.total}</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#DCE4F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#16845B] uppercase">Active Accounts</span>
          <div className="text-xl font-bold text-[#16845B] mt-0.5">{activeCount}</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#DCE4F0] shadow-xs">
          <span className="text-[11px] font-semibold text-[#BA1A1A] uppercase">Deactivated</span>
          <div className="text-xl font-bold text-[#BA1A1A] mt-0.5">{deactivatedCount}</div>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#DCE4F0] shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase">Superadmin & Staff</span>
          <div className="text-xl font-bold text-purple-700 mt-0.5">{adminCount}</div>
        </div>
      </div>

      {/* Filter and Query Control Center */}
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
            placeholder="Search by full name, campus email or #ID..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs text-[#0B1C30] placeholder:text-[#434655] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003EC3]/20"
          />
        </div>

        {/* Role & Status Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-medium text-[#0B1C30] appearance-none cursor-pointer focus:bg-white focus:outline-none"
          >
            <option value="">Role: All Roles</option>
            <option value="USER">Collegiate Members (USER)</option>
            <option value="ADMIN">Superadmins (ADMIN)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-[#EFF4FF] border border-[#DCE4F0] text-xs font-medium text-[#0B1C30] appearance-none cursor-pointer focus:bg-white focus:outline-none"
          >
            <option value="">Status: All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>

          {(search || roleFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setRoleFilter('');
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

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchUsers(p)}
        emptyMessage="No users found matching your search criteria."
      />

      {/* User Status Modal */}
      <UserStatusModal
        isOpen={Boolean(selectedUserForStatus)}
        user={selectedUserForStatus}
        onClose={() => setSelectedUserForStatus(null)}
        onConfirm={handleStatusChange}
      />
    </div>
  );
};

export default UserManagement;
