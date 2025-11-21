import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  authenticate: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  authenticate: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.authenticateWithTelegram();

      if (response.success && response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.error || 'Authentication failed'
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication service error'
      });
    }
  },

  getCurrentUser: async () => {
    const { user } = get();
    if (user) return; // Already have user data

    set({ isLoading: true, error: null });

    try {
      const response = await authService.getCurrentUser();

      if (response.success && response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.error || 'Failed to get user'
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to get user data'
      });
    }
  },

  updateUser: async (updates: Partial<User>) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.updateUser(updates);

      if (response.success && response.data) {
        set({
          user: response.data,
          isLoading: false,
          error: null
        });
      } else {
        set({
          isLoading: false,
          error: response.error || 'Failed to update user'
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Failed to update user data'
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false
    });
  }
}));