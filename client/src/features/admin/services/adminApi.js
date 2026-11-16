import api from '../../../services/api';

/**
 * FINDIT Admin Module API Client Service Layer
 * Interfaces strictly with authorized /api/v1/admin endpoints
 */
export const adminApi = {
  // ── Dashboard Overview Metrics ─────────────────────────────────────────────
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data?.data?.stats || response.data?.data || {};
  },

  // ── User Management ────────────────────────────────────────────────────────
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data?.data || { users: [], pagination: {} };
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data?.data?.user || response.data?.data || {};
  },

  updateUserStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/users/${id}/status`, { isActive });
    return response.data?.data?.user || response.data?.data;
  },

  // ── Item Moderation (Lost & Found Reports) ──────────────────────────────────
  getItems: async (params = {}) => {
    const response = await api.get('/admin/items', { params });
    return response.data?.data || { items: [], pagination: {} };
  },

  getItemById: async (id) => {
    const response = await api.get(`/admin/items/${id}`);
    return response.data?.data?.item || response.data?.data || {};
  },

  approveItem: async (id) => {
    const response = await api.patch(`/admin/items/${id}/approve`);
    return response.data?.data?.item || response.data?.data;
  },

  rejectItem: async (id, rejectionReason) => {
    const response = await api.patch(`/admin/items/${id}/reject`, { rejectionReason });
    return response.data?.data?.item || response.data?.data;
  },

  // ── Claim Moderation & Custody Transfer ────────────────────────────────────
  getClaims: async (params = {}) => {
    const response = await api.get('/admin/claims', { params });
    return response.data?.data || { claims: [], pagination: {} };
  },

  approveClaim: async (id) => {
    const response = await api.patch(`/admin/claims/${id}/approve`);
    return response.data?.data?.claim || response.data?.data;
  },

  rejectClaim: async (id, adminNote) => {
    const response = await api.patch(`/admin/claims/${id}/reject`, { adminNote });
    return response.data?.data?.claim || response.data?.data;
  },

  // ── Complaint & Report Moderation ──────────────────────────────────────────
  getReports: async (params = {}) => {
    const response = await api.get('/admin/reports', { params });
    return response.data?.data || { reports: [], pagination: {} };
  },

  reviewReport: async (id, { status, adminNote }) => {
    const response = await api.patch(`/admin/reports/${id}/review`, { status, adminNote });
    return response.data?.data?.report || response.data?.data;
  },

  // ── Category Management ────────────────────────────────────────────────────
  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data?.data?.categories || [];
  },

  createCategory: async ({ name, description }) => {
    const response = await api.post('/admin/categories', { name, description });
    return response.data?.data?.category || response.data?.data;
  },

  updateCategory: async (id, { name, description, isActive }) => {
    const response = await api.patch(`/admin/categories/${id}`, { name, description, isActive });
    return response.data?.data?.category || response.data?.data;
  },

  // ── AI Match Review ────────────────────────────────────────────────────────
  getAIMatches: async (params = {}) => {
    const response = await api.get('/admin/ai-matches', { params });
    return response.data?.data || { matches: [], pagination: {} };
  },

  reviewAIMatch: async (id, status) => {
    const response = await api.patch(`/admin/ai-matches/${id}/review`, { status });
    return response.data?.data?.match || response.data?.data;
  },

  // ── Immutable Audit Logs ───────────────────────────────────────────────────
  getActivityLogs: async (params = {}) => {
    const response = await api.get('/admin/activity-logs', { params });
    return response.data?.data || { logs: [], pagination: {} };
  },

  // ── System Configuration Settings ──────────────────────────────────────────
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data?.data?.settings || [];
  },

  updateSetting: async (key, value, description) => {
    const response = await api.patch(`/admin/settings/${key}`, { value, description });
    return response.data?.data?.setting || response.data?.data;
  }
};

export default adminApi;
