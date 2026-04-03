import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('spendlens_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('spendlens_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/me', data),
};

// Transactions
export const transactionAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  add: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
  uploadCSV: (formData) => API.post('/transactions/bulk-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAnalytics: (params) => API.get('/transactions/analytics', { params }),
  getSummary: () => API.get('/transactions/summary'),
};

// AI
export const aiAPI = {
  categorize: (data) => API.post('/ai/categorize', data),
  insights: (data) => API.post('/ai/insights', data),
  chat: (data) => API.post('/ai/chat', data),
};

export default API;
