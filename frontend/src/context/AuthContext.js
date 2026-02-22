import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services';
import { setAuthToken } from '../services/api';
import { MESSAGES } from '../constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      const userData = response.data?.data?.user || response.data?.user;
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { token, refreshToken, user: userData } = response.data?.data || response.data;

      setAuthToken(token);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(userData);
      toast.success(MESSAGES.LOGIN_SUCCESS);
      return { success: true, user: userData };
    } catch (error) {
      const errorMsg = error.response?.data?.message || MESSAGES.LOGIN_FAILED;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token, refreshToken, user: user_data } = response.data?.data || response.data;

      setAuthToken(token);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(user_data);
      toast.success(MESSAGES.REGISTER_SUCCESS);
      return { success: true, user: user_data };
    } catch (error) {
      const errorMsg = error.response?.data?.message || MESSAGES.REGISTER_FAILED;
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setAuthToken(null);
      setUser(null);
      toast.success(MESSAGES.LOGOUT_SUCCESS);
    }
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const canAccess = (requiredRole) => {
    if (!user) return false;
    if (requiredRole === null) return true;
    if (Array.isArray(requiredRole)) return requiredRole.includes(user.role);
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      updateUser,
      canAccess,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
