import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticate: () => Promise<void>;
  updateUserCoins: (coins: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  authenticate: async () => {
    set({ isLoading: true });

    try {
      // 1. Check if running in Telegram WebApp
      // @ts-ignore
      const telegram = window.Telegram?.WebApp;
      
      let userId: string | null = null;
      let telegramId: number | null = null;

      if (telegram && telegram.initDataUnsafe?.user) {
        // Production: Use Telegram Data
        telegramId = telegram.initDataUnsafe.user.id;
        
        // Simple fetch to get user by telegram_id
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', telegramId)
          .single();

        if (existingUser) {
          set({ user: existingUser, isAuthenticated: true });
        } else {
          // If user doesn't exist, we would usually create one here
          // For now, we assume user exists or handling registration separately
          console.log('User not found in DB, standard registration flow needed');
        }
      } else {
        // DEV MODE: Browser testing without Telegram
        console.warn('Running in Dev/Browser mode. Using Mock User.');
        
        // Try to find a dev user or create a session. 
        // For this core loop demo, we will check if we have a session.
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
           // Attempt anonymous sign in for RLS to work (if enabled in Supabase)
           await supabase.auth.signInAnonymously();
        }

        // We'll set a mock user state so the UI works. 
        // In a real app, we'd fetch the user associated with the anon session.
        const mockUser: User = {
          user_id: (await supabase.auth.getUser()).data.user?.id || 'dev-user-id',
          telegram_id: 123456789,
          username: 'dev_hero',
          full_name: 'Developer Hero',
          level: 5,
          total_coins: 150,
          current_streak: 3,
          longest_streak: 5,
          experience_points: 1200
        };
        
        set({ user: mockUser, isAuthenticated: true });
      }

    } catch (error) {
      console.error('Authentication failed:', error);
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserCoins: (coins) => {
    const user = get().user;
    if (user) {
      set({ user: { ...user, total_coins: user.total_coins + coins } });
    }
  }
}));
