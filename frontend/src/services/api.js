import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  getDemoAccounts: () => API.get('/auth/demo-accounts'),
  updateProfile: (data) => API.put('/auth/profile', data),
  sendVerificationOtp: () => API.post('/auth/send-verification-otp'),
  verifyOtp: (otp) => API.post('/auth/verify-otp', { otp }),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getMentors: () => API.get('/admin/mentors'),
  createMentor: (data) => API.post('/admin/mentors', data),
  getStudents: () => API.get('/admin/students'),
  createStudent: (data) => API.post('/admin/students', data),
  assignMentor: (data) => API.post('/admin/assign-mentor', data),
  autoAssign: () => API.post('/admin/auto-assign'),
  unassignMentor: (studentId) => API.delete(`/admin/unassign-mentor/${studentId}`),
};

export const mentorAPI = {
  getDashboard: () => API.get('/mentor/dashboard'),
  getStudents: (params) => API.get('/mentor/students', { params }),
  resolveAlert: (alertId) => API.put(`/mentor/alerts/${alertId}/resolve`),
  generateAiDiagnostic: (studentId) => API.post(`/mentor/ai-diagnostic/${studentId}`),
};

export const studentAPI = {
  getProfile: (id) => API.get(`/students/${id}/profile`),
  getMyDashboard: () => API.get('/students/me/dashboard'),
};

export const meetingAPI = {
  getMeetings: () => API.get('/meetings'),
  scheduleMeeting: (data) => API.post('/meetings', data),
  updateStatus: (id, status) => API.put(`/meetings/${id}/status`, { status }),
};

export const noteAPI = {
  createNote: (data) => API.post('/notes', data),
  updateActionItem: (noteId, actionItemId, status) => 
    API.put(`/notes/${noteId}/action-items/${actionItemId}`, { status }),
};

export const analyticsAPI = {
  getOverview: () => API.get('/analytics/overview'),
};

export const notificationAPI = {
  getNotifications: () => API.get('/notifications'),
  markAllRead: () => API.put('/notifications/read-all'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
};

export default API;
