import { supabase } from './supabase';
import { telegramService } from './telegram';
import { User, ApiResponse } from '@/types';

export class AuthService {
  async authenticateWithTelegram(): Promise<ApiResponse<User>> {
    try {
      const telegramUser = telegramService.telegramUser;
      const initData = telegramService.initData;

      if (!telegramUser || !initData) {
        return {
          success: false,
          error: 'Telegram authentication data not available'
        };
      }

      // Call Supabase function to authenticate/create user
      const { data, error } = await supabase.rpc('authenticate_telegram_user', {
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        full_name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
        avatar_url: telegramUser.photo_url,
        auth_data: initData
      });

      if (error) {
        console.error('Auth error:', error);
        return {
          success: false,
          error: 'Authentication failed'
        };
      }

      return {
        success: true,
        data: data[0] as User
      };
    } catch (error) {
      console.error('Auth service error:', error);
      return {
        success: false,
        error: 'Authentication service error'
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const telegramUser = telegramService.telegramUser;

      if (!telegramUser) {
        return {
          success: false,
          error: 'Telegram user not available'
        };
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (error) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: data as User
      };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        error: 'Failed to get user data'
      };
    }
  }

  async updateUser(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const telegramUser = telegramService.telegramUser;

      if (!telegramUser) {
        return {
          success: false,
          error: 'Telegram user not available'
        };
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('telegram_id', telegramUser.id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: 'Failed to update user'
        };
      }

      return {
        success: true,
        data: data as User
      };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: 'Failed to update user data'
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return telegramService.isAvailable && telegramService.telegramUser !== null;
  }
}

export const authService = new AuthService();