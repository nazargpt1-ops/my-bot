import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProgressCircle } from './ProgressCircle';
import { StreakBanner } from './StreakBanner';
import { TaskList } from './TaskList';
import { Task, CompletedTask } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { telegramService } from '@/lib/telegram';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

type ScreenType = 'dashboard' | 'create-task' | 'analytics' | 'achievements' | 'shop' | 'profile';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate dashboard stats
  const todayTasksCount = tasks.filter(task => {
    // Add logic to filter tasks for today based on recurrence
    return task.is_active;
  }).length;

  const completedTaskIds = new Set(completedTasks.map(ct => ct.task_id));
  const completedTodayCount = completedTasks.filter(ct => {
    const today = new Date().toDateString();
    return new Date(ct.completion_date).toDateString() === today;
  }).length;

  const dailyProgress = todayTasksCount > 0 ? (completedTodayCount / todayTasksCount) * 100 : 0;
  const weeklyProgress = 65; // Placeholder - calculate from weekly tasks
  const coinsEarnedToday = completedTasks
    .filter(ct => {
      const today = new Date().toDateString();
      return new Date(ct.completion_date).toDateString() === today;
    })
    .reduce((sum, ct) => sum + ct.coins_earned + ct.streak_bonus + ct.completion_bonus, 0);

  const currentStreak = user?.current_streak || 0;
  const longestStreak = user?.longest_streak || 0;
  const level = user?.level || 1;
  const levelProgress = 75; // Placeholder - calculate from XP

  useEffect(() => {
    // Set up Telegram main button for task creation
    if (telegramService.isAvailable) {
      telegramService.showMainButton('Add Task', () => {
        onNavigate('create-task');
      });
      telegramService.enableMainButton();
    }

    return () => {
      telegramService.hideMainButton();
    };
  }, [onNavigate]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load tasks and completed tasks
      // This would be replaced with actual API calls
      const mockTasks: Task[] = [
        {
          task_id: '1',
          user_id: user?.user_id || '',
          title: 'Morning workout',
          description: '30 minutes of exercise',
          category: 'sport',
          priority: 'high',
          recurrence_type: 'daily',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          coin_value: 18
        },
        {
          task_id: '2',
          user_id: user?.user_id || '',
          title: 'Read for 30 minutes',
          description: 'Read a book or article',
          category: 'learning',
          priority: 'medium',
          recurrence_type: 'daily',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          coin_value: 15
        }
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      // Mark task as completed
      // This would make an API call to complete the task

      // Animate completion
      telegramService.vibrate('medium');

      // Update local state
      const completedTask: CompletedTask = {
        completion_id: Date.now().toString(),
        user_id: user?.user_id || '',
        task_id: taskId,
        completion_date: new Date().toISOString().split('T')[0],
        completed_at: new Date().toISOString(),
        coins_earned: 10,
        streak_bonus: 2,
        completion_bonus: 0,
      };

      setCompletedTasks(prev => [...prev, completedTask]);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleAddTask = () => {
    onNavigate('create-task');
  };

  if (isAuthenticated && user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-background p-4 space-y-4"
      >
        {/* Header with user info */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span>🏆</span>
              <span>Level {user.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🪙</span>
              <span>{user.total_coins.toLocaleString()} coins</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Progress Circle */}
            <ProgressCircle
              dailyProgress={dailyProgress}
              weeklyProgress={weeklyProgress}
              currentStreak={currentStreak}
              coinsEarned={coinsEarnedToday}
              level={level}
            />

            {/* Streak Banner */}
            <StreakBanner
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />

            {/* Task List */}
            <TaskList
              tasks={tasks}
              completedTaskIds={completedTaskIds}
              onTaskComplete={handleTaskComplete}
              onAddTask={handleAddTask}
              isLoading={isLoading}
            />
          </>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate('analytics')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <span className="text-xl">📊</span>
            <span className="text-xs">Stats</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => onNavigate('achievements')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <span className="text-xl">🏅</span>
            <span className="text-xs">Awards</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => onNavigate('shop')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <span className="text-xl">🛍️</span>
            <span className="text-xs">Shop</span>
          </Button>
        </div>
      </motion.div>
    );
  }

  // Loading or authentication screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading HabitFlow...</p>
      </div>
    </div>
  );
};