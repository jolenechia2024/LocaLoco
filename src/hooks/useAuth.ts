// hooks/useAuth.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants/routes';
import { UserRole } from '../types/auth'; // Your existing type

// Mock validation - replace with real API later
const mockValidate = (email: string, password: string) => {
  return email && password.length >= 6;
};

export const useAuth = () => {
  const navigate = useNavigate();
  const store = useAuthStore();

  const login = useCallback(
    async (email: string, password: string, role: UserRole) => {
      try {
        // Simulate API call
        if (!mockValidate(email, password)) {
          throw new Error('Invalid credentials');
        }

        // Update store
        store.login(`${role}-1`, role, 'mock-token-123');
        
        // Navigate to map
        navigate(ROUTES.MAP);
        
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Login failed',
        };
      }
    },
    [store, navigate]
  );

  const signup = useCallback(
    async (data: any, role: UserRole) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        store.login(`${role}-1`, role, 'mock-token-123');
        navigate(ROUTES.MAP);
        
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Signup failed',
        };
      }
    },
    [store, navigate]
  );

  const logout = useCallback(() => {
    store.logout();
    navigate(ROUTES.HOME);
  }, [store, navigate]);

  return {
    isAuthenticated: store.isAuthenticated,
    role: store.role,
    userId: store.userId,
    login,
    signup,
    logout,
  };
};