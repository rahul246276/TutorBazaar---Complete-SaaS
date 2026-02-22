import api from './api';
import { API_ENDPOINTS } from '../constants';

export const authService = {
  login: (email, password) =>
    api.post(API_ENDPOINTS.AUTH_LOGIN, { email, password }),

  register: (data) =>
    api.post(API_ENDPOINTS.AUTH_REGISTER, data),

  getCurrentUser: () =>
    api.get(API_ENDPOINTS.AUTH_ME),

  logout: () =>
    api.post(API_ENDPOINTS.AUTH_LOGOUT),

  refreshToken: (refreshToken) =>
    api.post(API_ENDPOINTS.AUTH_REFRESH, { refreshToken }),
};

export const tutorService = {
  getTutors: (params) =>
    api.get(API_ENDPOINTS.TUTORS_LIST, { params }),

  getTutor: (id) =>
    api.get(API_ENDPOINTS.TUTORS_GET(id)),

  getDashboard: () =>
    api.get(API_ENDPOINTS.TUTORS_DASHBOARD),

  updateProfile: (data) =>
    api.put(API_ENDPOINTS.TUTORS_UPDATE, data),

  getLeads: (params) =>
    api.get(API_ENDPOINTS.TUTORS_LEADS, { params }),

  getCredits: () =>
    api.get(API_ENDPOINTS.TUTORS_CREDITS),

  getCreditTransactions: (params) =>
    api.get(API_ENDPOINTS.TUTORS_CREDITS_TRANSACTIONS, { params }),

  getAnalytics: (params) =>
    api.get(API_ENDPOINTS.TUTORS_ANALYTICS, { params }),

  unlockLead: (id, data) =>
    api.post(API_ENDPOINTS.LEADS_UNLOCK(id), data),

  respondToLead: (id, data) =>
    api.post(API_ENDPOINTS.LEADS_RESPOND(id), data),
};

export const studentService = {
  createEnquiry: (data) =>
    api.post(API_ENDPOINTS.STUDENTS_ENQUIRY, data),

  getProfile: () =>
    api.get(API_ENDPOINTS.STUDENTS_PROFILE),

  updateProfile: (data) =>
    api.put(API_ENDPOINTS.STUDENTS_UPDATE, data),
};

export const leadService = {
  getLeads: (params) =>
    api.get(API_ENDPOINTS.LEADS_LIST, { params }),

  getLead: (id) =>
    api.get(API_ENDPOINTS.LEADS_GET(id)),
};

export const paymentService = {
  getPayments: (params) =>
    api.get(API_ENDPOINTS.PAYMENTS_LIST, { params }),

  initiatePayment: (data) =>
    api.post(API_ENDPOINTS.PAYMENTS_INITIATE, data),

  verifyPayment: (data) =>
    api.post(API_ENDPOINTS.PAYMENTS_VERIFY, data),

  getPaymentHistory: (params) =>
    api.get(API_ENDPOINTS.PAYMENTS_HISTORY, { params }),
};

export const adminService = {
  getDashboard: () =>
    api.get(API_ENDPOINTS.ADMIN_DASHBOARD),

  getTutors: (params) =>
    api.get(API_ENDPOINTS.ADMIN_TUTORS, { params }),

  updateTutor: (id, data) =>
    api.put(API_ENDPOINTS.ADMIN_TUTORS_UPDATE(id), data),

  getLeads: (params) =>
    api.get(API_ENDPOINTS.ADMIN_LEADS, { params }),

  getPayments: (params) =>
    api.get(API_ENDPOINTS.ADMIN_PAYMENTS, { params }),
};
