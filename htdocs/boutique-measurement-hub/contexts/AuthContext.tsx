import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { mockAdminLogin, mockEmployeeLogin, realEmployeeLogin } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  updateAuthUser: (updatedFields: Partial<User>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from session storage", error);
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (phone: string, password: string) => {
    setLoading(true);
    try {
      const userData = await realEmployeeLogin(phone, password);
      setUser(userData);
      sessionStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      setUser(null);
      sessionStorage.removeItem('user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAuthUser = (updatedFields: Partial<User>) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const newUser = { ...prevUser, ...updatedFields };
        sessionStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const value = { user, loading, login, logout, updateAuthUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};