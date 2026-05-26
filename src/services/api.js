import axios from 'axios';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// Assets API
export const assetsAPI = {
  getAll: async () => {
    const response = await api.get('/assets');
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  create: async (assetData) => {
    const response = await api.post('/assets', assetData);
    return response.data;
  },

  update: async (id, assetData) => {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/assets/stats');
    return response.data;
  },
};

// Threats API
export const threatsAPI = {
  getAll: async () => {
    const response = await api.get('/threats');
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/threats/${id}`);
    return response.data;
  },

  create: async (threatData) => {
    const response = await api.post('/threats', threatData);
    return response.data;
  },

  update: async (id, threatData) => {
    const response = await api.put(`/threats/${id}`, threatData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/threats/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/threats/stats');
    return response.data;
  },
};

// Users API (Admin only)
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  updateStatus: async (id, isActive) => {
    const response = await api.put(`/users/${id}/status`, { isActive });
    return response.data;
  },

  updateRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getAuditLog: async (limit = 50, offset = 0) => {
    const response = await api.get(`/users/audit-log?limit=${limit}&offset=${offset}`);
    return response.data;
  },
};

// Risk Assessments API
export const assessmentsAPI = {
  getAll: async () => {
    const response = await api.get('/assessments');
    return response.data;
  },

  getOne: async (id) => {
    const response = await api.get(`/assessments/${id}`);
    return response.data;
  },

  create: async (assessmentData) => {
    const response = await api.post('/assessments', assessmentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/assessments/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/assessments/stats');
    return response.data;
  },
};

export default api;