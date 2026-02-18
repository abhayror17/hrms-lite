import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const employeeApi = {
  getAll: async () => {
    const response = await api.get('/api/employees');
    return response.data;
  },
  
  create: async (employeeData) => {
    const response = await api.post('/api/employees', employeeData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/api/employees/${id}`);
  },
  
  getDepartments: async () => {
    const response = await api.get('/api/employees/departments');
    return response.data;
  },
};

export const attendanceApi = {
  markAttendance: async (attendanceData) => {
    const response = await api.post('/api/attendance', attendanceData);
    return response.data;
  },
  
  getByEmployee: async (employeeId) => {
    const response = await api.get(`/api/attendance/${employeeId}`);
    return response.data;
  },
  
  getAll: async (dateFilter = null) => {
    const url = dateFilter 
      ? `/api/attendance?date=${dateFilter}` 
      : '/api/attendance';
    const response = await api.get(url);
    return response.data;
  },
  
  getWeeklyStats: async () => {
    const response = await api.get('/api/attendance/stats/weekly');
    return response.data;
  },
};

export default api;
