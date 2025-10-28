// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '../types/auth'; // Import from your existing types

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
  token: string | null;
}

export interface AuthActions {
  login: (userId: string, role: UserRole, token?: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  userId: null,
  token: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      login: (userId, role, token) => {
        set({
          isAuthenticated: true,
          userId,
          role,
          token: token || null,
        });
      },
      
      logout: () => {
        set(initialState);
      },
      
      setRole: (role) => {
        set({ role });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        userId: state.userId,
        token: state.token,
      }),
    }
  )
);

// Selectors for better performance (use these in components)
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectUserRole = (state: AuthStore) => state.role;
export const selectUserId = (state: AuthStore) => state.userId;