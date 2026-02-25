import api from './api';
import { API_ENDPOINTS } from '../constants';
import { mapLead, mapPayment, mapTutor } from './transformers';

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
  getTutors: async (params) => {
    const response = await api.get(API_ENDPOINTS.TUTORS_LIST, { params });
    const payload = response.data?.data || {};
    return {
      ...payload,
      tutors: (payload.tutors || []).map(mapTutor),
    };
  },

  getTutor: async (id) => {
    const response = await api.get(API_ENDPOINTS.TUTORS_GET(id));
    const tutor = response.data?.data?.tutor || response.data?.tutor || response.data?.data;
    return mapTutor(tutor);
  },

  getDashboard: async () => {
    const response = await api.get(API_ENDPOINTS.TUTORS_DASHBOARD);
    return response.data?.data || {};
  },

  updateProfile: (data) =>
    api.put(API_ENDPOINTS.TUTORS_UPDATE, data),

  getLeads: async (params = {}) => {
    const { type = 'available', ...rest } = params;
    const endpoint = type === 'unlocked' ? API_ENDPOINTS.TUTORS_LEADS_MY : API_ENDPOINTS.TUTORS_LEADS_AVAILABLE;
    const response = await api.get(endpoint, { params: rest });
    const payload = response.data?.data || {};
    return {
      ...payload,
      leads: (payload.leads || []).map(mapLead),
    };
  },

  getCredits: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.TUTORS_CREDITS, { params });
    return response.data?.data || {};
  },

  getCreditTransactions: async (params = {}) => {
    const response = await api.get(API_ENDPOINTS.TUTORS_CREDITS, { params });
    return response.data?.data?.history || { transactions: [], pagination: {} };
  },

  getAnalytics: async (params) => {
    const response = await api.get(API_ENDPOINTS.TUTORS_ANALYTICS, { params });
    return response.data?.data || {};
  },

  unlockLead: (id) =>
    api.post(API_ENDPOINTS.TUTORS_LEADS_UNLOCK(id), {}),

  purchaseCredits: (creditPackage) =>
    api.post(API_ENDPOINTS.TUTORS_CREDITS_PURCHASE, { package: creditPackage }),

  verifyCreditPayment: (data) =>
    api.post(API_ENDPOINTS.TUTORS_CREDITS_VERIFY, data),
};

export const studentService = {
  createEnquiry: (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      city: data.city,
      locality: data.locality || '',
      class: data.grade,
      board: data.board || 'Other',
      subjects: [data.subject].filter(Boolean),
      mode: data.mode || 'both',
      budget: {
        min: data.budget ? Number(data.budget) : undefined,
        max: data.budget ? Number(data.budget) : undefined,
      },
      preferredTiming: data.preferredTime || '',
      goals: data.description,
      specialRequirements: data.title,
    };
    return api.post(API_ENDPOINTS.STUDENTS_ENQUIRY, payload);
  },

  getProfile: () =>
    api.get(API_ENDPOINTS.STUDENTS_PROFILE),

  updateProfile: (data) =>
    api.put(API_ENDPOINTS.STUDENTS_UPDATE, data),

  contact: (data) =>
    api.post(API_ENDPOINTS.STUDENTS_CONTACT, data),
};

export const leadService = {
  getLeads: (params) =>
    api.get(API_ENDPOINTS.LEADS_LIST, { params }),

  getLead: (id) =>
    api.get(API_ENDPOINTS.LEADS_GET(id)),
};

export const paymentService = {
  getPaymentHistory: async (params) => {
    const response = await api.get(API_ENDPOINTS.PAYMENTS_HISTORY, { params });
    const payload = response.data?.data || {};
    return {
      ...payload,
      payments: (payload.payments || []).map(mapPayment),
    };
  },
};

export const adminService = {
  getDashboard: async () => {
    const response = await api.get(API_ENDPOINTS.ADMIN_DASHBOARD);
    return response.data?.data || {};
  },

  getTutors: async (params) => {
    const response = await api.get(API_ENDPOINTS.ADMIN_TUTORS, { params });
    const payload = response.data?.data || {};
    return {
      ...payload,
      tutors: (payload.tutors || []).map(mapTutor),
    };
  },

  approveTutor: (id) =>
    api.put(API_ENDPOINTS.ADMIN_TUTORS_APPROVE(id)),

  suspendTutor: (id, reason) =>
    api.put(API_ENDPOINTS.ADMIN_TUTORS_SUSPEND(id), { reason }),

  getLeads: async (params) => {
    const response = await api.get(API_ENDPOINTS.ADMIN_LEADS, { params });
    const payload = response.data?.data || {};
    return {
      ...payload,
      leads: (payload.leads || []).map(mapLead),
    };
  },

  getPayments: async (params) => {
    const response = await api.get(API_ENDPOINTS.ADMIN_PAYMENTS, { params });
    const payload = response.data?.data || {};
    return {
      ...payload,
      payments: (payload.payments || []).map(mapPayment),
    };
  },
};
