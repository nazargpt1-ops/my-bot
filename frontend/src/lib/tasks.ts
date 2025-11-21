import { supabase } from './supabase';
import { Task, CompletedTask, ApiResponse } from '@/types';

export class TaskService {
  async getTasks(userId: string, date?: Date): Promise<ApiResponse<Task[]>> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Filter by date if provided (for recurring tasks)
      if (date) {
        // This would be enhanced to handle recurring tasks properly
        const today = date.toDateString();
        // Add date filtering logic here
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data as Task[]
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch tasks'
      };
    }
  }

  async createTask(task: Omit<Task, 'task_id' | 'user_id' | 'created_at' | 'updated_at' | 'coin_value'>): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          // coin_value will be calculated automatically by the database
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data as Task
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create task'
      };
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('task_id', taskId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data as Task
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update task'
      };
    }
  }

  async deleteTask(taskId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_active: false })
        .eq('task_id', taskId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete task'
      };
    }
  }

  async completeTask(taskId: string, userId: string): Promise<ApiResponse<CompletedTask>> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get task details for coin calculation
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('task_id', taskId)
        .single();

      if (taskError || !task) {
        return {
          success: false,
          error: 'Task not found'
        };
      }

      // Check if already completed today
      const { data: existingCompletion } = await supabase
        .from('completed_tasks')
        .select('*')
        .eq('task_id', taskId)
        .eq('completion_date', today)
        .single();

      if (existingCompletion) {
        return {
          success: false,
          error: 'Task already completed today'
        };
      }

      // Calculate bonuses
      let streakBonus = 0;
      let completionBonus = 0;

      // Get user's current streak for bonus calculation
      const { data: user } = await supabase
        .from('users')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      if (user) {
        // Streak bonuses
        if (user.current_streak >= 30) streakBonus = 10;
        else if (user.current_streak >= 7) streakBonus = 5;
        else if (user.current_streak >= 3) streakBonus = 2;
      }

      // Create completion record
      const { data, error } = await supabase
        .from('completed_tasks')
        .insert([{
          user_id: userId,
          task_id: taskId,
          completion_date: today,
          coins_earned: task.coin_value,
          streak_bonus: streakBonus,
          completion_bonus: completionBonus,
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Update task's last completion time
      await supabase
        .from('tasks')
        .update({ last_completed_at: new Date().toISOString() })
        .eq('task_id', taskId);

      return {
        success: true,
        data: data as CompletedTask
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to complete task'
      };
    }
  }

  async getCompletedTasks(userId: string, startDate?: Date, endDate?: Date): Promise<ApiResponse<CompletedTask[]>> {
    try {
      let query = supabase
        .from('completed_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (startDate) {
        query = query.gte('completion_date', startDate.toISOString().split('T')[0]);
      }

      if (endDate) {
        query = query.lte('completion_date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data as CompletedTask[]
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch completed tasks'
      };
    }
  }
}

export const taskService = new TaskService();