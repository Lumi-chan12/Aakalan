import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  roleKey: string;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email?: string; role?: string; password?: string }) => Promise<void>;
  logout: () => void;
  switchRole: (newRoleKey: 'admin' | 'scrutiny' | 'regional' | 'institution') => Promise<void>;
  currentPath: string;
  navigate: (path: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roleKey, setRoleKey] = useState<string>(ApiService.getActiveRole());
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/login');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  const getDefaultPathForRole = (userRole: UserRole): string => {
    switch (userRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SCRUTINY_OFFICER':
        return '/scrutiny/dashboard';
      case 'REGIONAL_OFFICER':
        return '/regional/dashboard';
      case 'INSTITUTION':
        return '/institution/dashboard';
      default:
        return '/admin/dashboard';
    }
  };

  const loadUser = async () => {
    try {
      setLoading(true);
      // Check if logged out previously
      const isLoggedOut = localStorage.getItem('aakalan_logged_out') === 'true';
      if (isLoggedOut || window.location.pathname === '/login') {
        setUser(null);
        setCurrentPath('/login');
        return;
      }

      const data = await ApiService.getMe();
      setUser(data.user);
      if (data.user.region) {
        setSelectedRegion(data.user.region);
      }
    } catch (err) {
      console.error('Failed to load user in AuthProvider', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = async (payload: { email?: string; role?: string; password?: string }) => {
    setLoading(true);
    try {
      localStorage.removeItem('aakalan_logged_out');
      const res = await ApiService.login(payload);
      setUser(res.user);
      if (res.roleKey) {
        setRoleKey(res.roleKey);
      }
      if (res.user.region) {
        setSelectedRegion(res.user.region);
      } else {
        setSelectedRegion('ALL');
      }

      // Strict role-derived landing redirection
      const targetPath = getDefaultPathForRole(res.user.role);
      navigate(targetPath);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.setItem('aakalan_logged_out', 'true');
    setUser(null);
    navigate('/login');
  };

  const switchRole = async (newRoleKey: 'admin' | 'scrutiny' | 'regional' | 'institution') => {
    setLoading(true);
    try {
      localStorage.removeItem('aakalan_logged_out');
      const res = await ApiService.switchRole(newRoleKey);
      setUser(res.user);
      setRoleKey(newRoleKey);
      if (res.user.region) {
        setSelectedRegion(res.user.region);
      } else {
        setSelectedRegion('ALL');
      }
      const targetPath = getDefaultPathForRole(res.user.role);
      navigate(targetPath);
    } catch (err) {
      console.error('Error switching demo role:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        roleKey,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        currentPath,
        navigate,
        selectedRegion,
        setSelectedRegion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
