import axios from 'axios';
import { MESSAGES, HTTP_STATUS } from '../constants';
import { getStoredToken, getStoredRefreshToken, clearAuthStorage, setStoredToken } from '../utils/storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const refreshAuthToken = async () => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  const newToken = response.data?.data?.token;
  if (!newToken) {
    throw new Error('Invalid refresh response');
  }

  setStoredToken(newToken);
  api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  return newToken;
};

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const token = await refreshAuthToken();
          isRefreshing = false;
          onTokenRefreshed(token);
        } catch (refreshError) {
          isRefreshing = false;
          clearAuthStorage();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject(new Error(MESSAGES.NETWORK_ERROR));
    }

    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      clearAuthStorage();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    setStoredToken(token);
  } else {
    delete api.defaults.headers.common.Authorization;
    clearAuthStorage();
  }
};

export const getAuthToken = () => {
  return getStoredToken();
};

export default api;
