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

// Handle API errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
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
  generate: (data) => api.post('/analysis/generate', data, { timeout: 10000 }),
  get: (projectId) => api.get(`/analysis/${projectId}`),
};

// Funding Kit APIs
export const fundingKitAPI = {
  generate: (data) => api.post('/funding-kit/generate', data, { timeout: 120000 }),
  get: (projectId) => api.get(`/funding-kit/${projectId}`),
  generateLogo: (data) => api.post('/funding-kit/generate-logo', data, { timeout: 120000 }),
  generateVideo: (data) => api.post('/funding-kit/generate-video', data, { timeout: 600000 }),
  getLogos: (projectId) => api.get(`/funding-kit/${projectId}/logos`),
  getVideos: (projectId) => api.get(`/funding-kit/${projectId}/videos`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
