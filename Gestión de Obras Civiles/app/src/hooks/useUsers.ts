import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types';

const USERS_KEY = 'sismich_users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  }, []);

  const saveUsers = useCallback((newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
  }, []);

  const createUser = useCallback((userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    saveUsers(updated);
    return newUser;
  }, [users, saveUsers]);

  const updateUser = useCallback((id: string, updates: Partial<User>): User | null => {
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    saveUsers(updated);
    return updated.find(u => u.id === id) || null;
  }, [users, saveUsers]);

  const deleteUser = useCallback((id: string): boolean => {
    const updated = users.filter(u => u.id !== id);
    saveUsers(updated);
    return updated.length < users.length;
  }, [users, saveUsers]);

  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(u => u.id === id);
  }, [users]);

  const getUsersByRole = useCallback((role: UserRole): User[] => {
    return users.filter(u => u.role === role && u.isActive);
  }, [users]);

  const resetPassword = useCallback((id: string, newPassword: string): boolean => {
    const updated = users.map(u => 
      u.id === id ? { ...u, password: newPassword } : u
    );
    saveUsers(updated);
    return true;
  }, [users, saveUsers]);

  return {
    users,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    getUsersByRole,
    resetPassword,
  };
}
