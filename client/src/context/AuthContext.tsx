'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { debug } from '@/lib/debug';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  preferences: {
    dietaryRestrictions: string[];
    familySize: number | null;
    budgetGoal: 'low' | 'medium' | 'high';
    cookingSkill: 'beginner' | 'intermediate' | 'advanced';
    householdType: 'single' | 'couple' | 'family-small' | 'family-large';
    onboardingComplete: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    const loginUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`;
    debug('[Auth] Login redirect URL:', loginUrl);
    debug('[Auth] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    window.location.href = loginUrl;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
