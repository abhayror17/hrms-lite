import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee APIs
export const employeeService = {
  getAll: (params = {}) => api.get('/api/employees', { params }),
  getById: (id) => api.get(`/api/employees/${id}`),
  create: (data) => api.post('/api/employees', data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  delete: (id) => api.delete(`/api/employees/${id}`),
  getSummary: (id) => api.get(`/api/employees/${id}/summary`),
  getDashboardStats: () => api.get('/api/employees/dashboard/stats'),
};

// Attendance APIs
export const attendanceService = {
  getAll: (params = {}) => api.get('/api/attendance', { params }),
  getByEmployee: (employeeId, params = {}) => api.get(`/api/attendance/employee/${employeeId}`, { params }),
  create: (data) => api.post('/api/attendance', data),
  update: (id, status) => api.put(`/api/attendance/${id}?status=${status}`),
  delete: (id) => api.delete(`/api/attendance/${id}`),
  getToday: () => api.get('/api/attendance/today'),
};

export default api;
