import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, ApiResponse } from '../types';
import { apiGet, apiPost, apiPut } from '../utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
  village?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('JalSuraksha_token'));
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('JalSuraksha_token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiGet<any>('/auth/me');
      setUser(response.data.user);
      setToken(storedToken);
    } catch (error) {
      localStorage.removeItem('JalSuraksha_token');
      localStorage.removeItem('JalSuraksha_user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiPost<ApiResponse<{ user: User; token: string }>>('/auth/login', {
        email,
        password,
      });
      const { user: userData, token: authToken } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('JalSuraksha_token', authToken);
      localStorage.setItem('JalSuraksha_user', JSON.stringify(userData));
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await apiPost<ApiResponse<User>>('/auth/register', data);
      toast.success('Registration successful! Please login.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('JalSuraksha_token');
    localStorage.removeItem('JalSuraksha_user');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await apiPut<ApiResponse<User>>('/auth/profile', data);
      setUser(response.data);
      localStorage.setItem('JalSuraksha_user', JSON.stringify(response.data));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiPut<ApiResponse<void>>('/auth/password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
