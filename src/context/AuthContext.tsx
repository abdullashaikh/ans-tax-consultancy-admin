import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, RoleName } from '../types';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: RoleName[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isConsultant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ans_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('ans_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('ans_user', JSON.stringify(response.data));
      }
    } catch {
      localStorage.removeItem('ans_access_token');
      localStorage.removeItem('ans_user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials);
    if (response.success && response.data) {
      const { user: loggedInUser, accessToken } = response.data;
      localStorage.setItem('ans_access_token', accessToken);
      localStorage.setItem('ans_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('ans_access_token');
      localStorage.removeItem('ans_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const hasRole = (...roles: RoleName[]): boolean => {
    if (!user || !user.roles) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    return roles.some((role) => user.roles.includes(role));
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    return user.permissions.includes(permission);
  };

  const isAdmin = Boolean(user && (user.roles.includes('SUPER_ADMIN') || user.roles.includes('ADMIN')));
  const isConsultant = Boolean(user && user.roles.includes('CONSULTANT'));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        hasRole,
        hasPermission,
        isAdmin,
        isConsultant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
