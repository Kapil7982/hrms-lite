import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Employee APIs
export const employeeApi = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  delete: (id) => api.delete(`/employees/${id}`)
};

// Attendance APIs
export const attendanceApi = {
  getAll: (params) => api.get('/attendance', { params }),
  getByEmployee: (employeeId, params) => api.get(`/attendance/${employeeId}`, { params }),
  mark: (data) => api.post('/attendance', data),
  getStats: (employeeId) => api.get(`/attendance/stats/${employeeId}`)
};

// Dashboard APIs
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats')
};

export default api;
