"use client"
import { useState, useEffect } from 'react';
import type { UserData } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoadingUser,
    setIsLoadingUser
  };
} 