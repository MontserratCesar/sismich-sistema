import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types';

const AUTH_KEY = 'sismich_auth';
const USERS_KEY = 'sismich_users';

// Usuario admin por defecto
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  name: 'Administrador',
  email: 'admin@sismich.com',
  createdAt: new Date().toISOString(),
  isActive: true,
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar usuarios por defecto
  useEffect(() => {
    const users = localStorage.getItem(USERS_KEY);
    if (!users) {
      localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
    }
    
    // Verificar si hay sesión activa
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setUser(parsed.user);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((username: string, password: string, role: UserRole): boolean => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const foundUser = users.find(
      (u: User) => 
        u.username === username && 
        u.password === password && 
        u.role === role &&
        u.isActive
    );

    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, JSON.stringify({ user: foundUser, timestamp: Date.now() }));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
