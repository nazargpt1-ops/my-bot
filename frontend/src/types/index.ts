// Core types for HabitFlow Telegram Mini App

export interface User {
  user_id: string;
  telegram_id: number;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  telegram_auth_data?: object;
  created_at: string;
  updated_at: string;

  // Game progression
  level: number;
  total_coins: number;
  current_streak: number;
  longest_streak: number;
  experience_points: number;

  // Preferences
  theme_preference: 'light' | 'dark' | 'neon' | 'nature' | 'ocean' | 'sunset';
  notification_enabled: boolean;
  timezone: string;
}

export interface Task {
  task_id: string;
  user_id: string;

  // Task details
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;

  // Recurrence
  recurrence_type: RecurrenceType;
  recurrence_config?: RecurrenceConfig;
  reminder_time?: string; // HH:MM format
  due_time?: string; // HH:MM format

  // Status & timing
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_completed_at?: string;

  // Calculated field
  coin_value: number;
}

export interface CompletedTask {
  completion_id: string;
  user_id: string;
  task_id: string;
  completion_date: string;
  completed_at: string;
  coins_earned: number;
  streak_bonus: number;
  completion_bonus: number;
  notes?: string;
}

export interface Achievement {
  achievement_id: string;
  user_id: string;
  achievement_type: AchievementType;
  progress_value: number;
  target_value: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  notification_sent: boolean;
}

export interface UserReward {
  reward_id: string;
  user_id: string;
  reward_type: RewardType;
  reward_item_id: string;
  purchased_at: string;
  is_active: boolean;
  expires_at?: string;
  coins_spent: number;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  message: string;
  type: NotificationType;
  scheduled_at?: string;
  sent_at?: string;
  status: NotificationStatus;
  metadata?: object;
}

// Enums
export type TaskCategory = 'sport' | 'health' | 'work' | 'learning' | 'rest' | 'personal';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom';

export interface RecurrenceConfig {
  days?: string[]; // ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  interval?: number; // Every X days/weeks
}

export type AchievementType =
  | 'first_task'
  | 'week_warrior'
  | 'month_master'
  | 'task_champion'
  | 'perfect_week'
  | 'category_expert';

export type RewardType = 'theme' | 'sticker_pack' | 'profile_border' | 'power_up';
export type NotificationType = 'reminder' | 'congratulations' | 'achievement' | 'streak';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

// UI State types
export interface AppState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface TaskState {
  tasks: Task[];
  completedTasks: CompletedTask[];
  isLoading: boolean;
  error: string | null;
}

export interface AchievementState {
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
}

export interface ShopState {
  availableThemes: Theme[];
  userRewards: UserReward[];
  isLoading: boolean;
  error: string | null;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  price: number;
  is_premium: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    auth_date?: string;
    hash?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setText: (text: string) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
}

// Dashboard analytics
export interface DashboardStats {
  dailyProgress: number;
  weeklyProgress: number;
  todayTasksCount: number;
  completedTodayCount: number;
  currentStreak: number;
  coinsEarnedToday: number;
  levelProgress: number; // 0-100
  nextLevelAt: number;
}

// Achievement definitions for UI
export interface AchievementDefinition {
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  targetValue: number;
  coinsReward: number;
}

// Shop items
export interface ShopItem {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  price: number;
  icon: string;
  is_premium: boolean;
}