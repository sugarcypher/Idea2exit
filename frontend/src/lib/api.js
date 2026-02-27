import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Project APIs
export const projectAPI = {
  create: (data) => api.post('/projects', data),
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  delete: (id) => api.delete(`/projects/${id}`),
  getAgents: (id) => api.get(`/projects/${id}/agents`),
};

// Document APIs
export const documentAPI = {
  generate: (data) => api.post('/documents/generate', data),
  getAll: (projectId) => api.get(`/documents/${projectId}`),
  getOne: (id) => api.get(`/documents/detail/${id}`),
};

// Landing Page APIs
export const landingPageAPI = {
  generate: (data) => api.post('/landing-page/generate', data),
  get: (projectId) => api.get(`/landing-page/${projectId}`),
};

// Analysis APIs
export const analysisAPI = {
  generate: (data) => api.post('/analysis/generate', data),
  get: (projectId) => api.get(`/analysis/${projectId}`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
