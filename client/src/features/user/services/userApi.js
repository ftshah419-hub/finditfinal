import api from '../../../services/api';

export const userApi = {
  // ── Profile ─────────────────────────────────────────────────────────────
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.patch('/users/profile', profileData);
    return res.data;
  },

  // ── Aggregated Dashboard Statistics ────────────────────────────────────
  getDashboardStats: async () => {
    const res = await api.get('/users/dashboard-stats');
    return res.data;
  },

  // ── Categories & Public Search ──────────────────────────────────────────
  getCategories: async () => {
    const res = await api.get('/users/categories');
    return res.data;
  },

  searchItems: async (params = {}) => {
    const res = await api.get('/users/search', { params });
    return res.data;
  },

  // ── Items (Lost & Found) ────────────────────────────────────────────────
  getMyItems: async (params = {}) => {
    const res = await api.get('/users/items', { params });
    return res.data;
  },

  getItemDetails: async (itemId) => {
    const res = await api.get(`/users/items/${itemId}`);
    return res.data;
  },

  createItem: async (formData) => {
    const isFormData = formData instanceof FormData;
    const res = await api.post('/users/items', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
    return res.data;
  },

  updateItem: async (itemId, formData) => {
    const isFormData = formData instanceof FormData;
    const res = await api.patch(`/users/items/${itemId}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
    return res.data;
  },

  deleteItem: async (itemId) => {
    const res = await api.delete(`/users/items/${itemId}`);
    return res.data;
  },

  // ── Claims ──────────────────────────────────────────────────────────────
  getMyClaims: async (params = {}) => {
    const res = await api.get('/users/claims', { params });
    return res.data;
  },

  submitClaim: async (itemId, formData) => {
    const isFormData = formData instanceof FormData;
    const res = await api.post(`/users/items/${itemId}/claims`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
    });
    return res.data;
  },

  withdrawClaim: async (claimId) => {
    const res = await api.patch(`/users/claims/${claimId}/withdraw`);
    return res.data;
  },

  // ── Notifications ───────────────────────────────────────────────────────
  getNotifications: async (params = {}) => {
    const res = await api.get('/users/notifications', { params });
    return res.data;
  },

  markNotificationRead: async (notificationId) => {
    const res = await api.patch(`/users/notifications/${notificationId}/read`);
    return res.data;
  },

  // ── AI Smart Matches ────────────────────────────────────────────────────
  getAIMatches: async (params = {}) => {
    const res = await api.get('/users/ai-matches', { params });
    return res.data;
  },

  dismissAIMatch: async (matchId) => {
    const res = await api.patch(`/users/ai-matches/${matchId}/dismiss`);
    return res.data;
  },

  // ── Reports / Complaints ────────────────────────────────────────────────
  submitComplaint: async (reportData) => {
    const res = await api.post('/users/reports', reportData);
    return res.data;
  }
};

export default userApi;
