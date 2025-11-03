// hooks/useAuth.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ROUTES } from '../constants/routes';
import { UserRole } from '../types/auth';
import { authClient, callbackURL } from '../lib/authClient';

export const useAuth = () => {
  const navigate = useNavigate();
  const store = useAuthStore();

  const login = useCallback(
    async (email: string, password: string, role: UserRole) => {
      try {
        // Call better-auth API
        const { data, error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: callbackURL
        });

        if (error) {
          return {
            success: false,
            error: error.message || 'Invalid credentials',
          };
        }

        // Check if we have a valid session
        const session = await authClient.getSession();

        if (session?.data?.session) {
          const user = session.data.user;
          const userId = user?.id || 'unknown';
          const accessToken = session.data.session.token;

          // Update store with real data
          store.login(userId, role, accessToken);

          // Navigate to map
          navigate(ROUTES.MAP);

          return { success: true };
        } else {
          return {
            success: false,
            error: 'No session created',
          };
        }
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
    async (email: string, password: string, name: string, role: UserRole) => {
      try {
        // Call better-auth API
        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: callbackURL
        });

        if (error) {
          return {
            success: false,
            error: error.message || 'Signup failed',
          };
        }

        // Check if we have a valid session
        const session = await authClient.getSession();

        if (session?.data?.session) {
          const user = session.data.user;
          const userId = user?.id || 'unknown';
          const accessToken = session.data.session.token;

          // Update store with real data
          store.login(userId, role, accessToken);
          navigate(ROUTES.MAP);

          return { success: true };
        } else {
          // Signup successful but no auto-login, redirect to login
          return {
            success: true,
            message: 'Signup successful! Please log in.',
          };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Signup failed',
        };
      }
    },
    [store, navigate]
  );

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      // Call better-auth logout
      await authClient.signOut();
      console.log('✅ Backend session cleared');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Always clear local store
      store.logout();
      console.log('✅ Local store cleared');

      // Redirect to home/login
      navigate(ROUTES.HOME);
    }
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