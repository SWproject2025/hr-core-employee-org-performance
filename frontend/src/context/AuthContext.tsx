"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  employeeProfileId: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>; // Added Register
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Load User/Token from LocalStorage on App Start
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    }
  }, []);

  // 2. CRITICAL FIX: Attach Token to Axios Headers whenever it changes
  useEffect(() => {
    if (token) {
      // Apply to every request
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // Remove if no token
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { access_token } = response.data;
      
      if (!access_token) {
        throw new Error('No access token received');
      }

      // Decode JWT token to get user info
      const tokenParts = access_token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      
      const userInfo: User = {
        employeeProfileId: payload.employeeProfileId || payload.sub || '',
        email: payload.email || email,
        roles: payload.roles || [],
        firstName: payload.firstName,
        lastName: payload.lastName,
      };

      setToken(access_token);
      setUser(userInfo);

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userInfo));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  // 3. Added Register Function
  const register = async (data: RegisterData) => {
    try {
      // Map frontend fields to backend expectations
      // Assuming backend expects "workEmail" or "personalEmail" - adjust if needed
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        nationalId: data.nationalId,
        workEmail: data.email, // Using email as workEmail for registration
        personalEmail: data.email, // Or personalEmail, depending on your backend validation
        password: data.password,
        // Default values if backend requires them:
        gender: 'MALE', 
        maritalStatus: 'SINGLE',
        mobilePhone: '01000000000' 
      };

      await axios.post(`${API_URL}/auth/register`, payload);
      
      // We don't auto-login here, we let the user log in after registering
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization']; // Clear header immediately
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register, // Export register
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}