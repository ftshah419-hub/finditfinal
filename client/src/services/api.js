import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Sends and receives secure HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Configure runtime in-memory Authorization header as a fallback/companion to HTTP-only cookies.
 * Does not store any tokens in localStorage.
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Response interceptor to format errors consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.message || 'An unexpected error occurred. Please try again.',
      errorCode: error.response?.data?.errorCode || 'NETWORK_OR_SERVER_ERROR',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || []
    };
    return Promise.reject(customError);
  }
);

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.data?.token) {
      setAuthToken(response.data.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.data?.token) {
      setAuthToken(response.data.data.token);
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } finally {
      setAuthToken(null);
    }
  }
};

export default api;
