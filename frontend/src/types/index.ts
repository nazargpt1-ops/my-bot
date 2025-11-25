// frontend/src/types/index.ts

// --- API ---
export interface ApiResponse<T> {
  success?: boolean;      // Добавлено поле success
  data?: T | null;        // Сделано необязательным (?), чтобы не ругался, если данных нет
  error?: string | null;  // Сделано необязательным
}

// --- USER ---
export interface User {
  id: string;
  user_id?: string;       // Алиас для совместимости
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;     // Добавлено для исправления ошибки 'full_name does not exist'
  language_code?: string;
  
  // Аватарки (разные варианты из кода ИИ)
  photo_url?: string;
  avatar_url?: string;

  // Монеты
  coins: number;
  total_coins?: number;   // Добавлено для совместимости

  // Стрики (серии)
  streak_days: number;
  current_streak?: number; // Добавлено для совместимости

  level: number;
  created_at: string;
}

// --- TASK ---
export type TaskStatus = 'pending' | 'completed' | 'in_progress' | string;

export interface Task {
  id: string;
  task_id?: string;       // Алиас для совместимости
  user_id: string;
  
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | string;
  category: 'work' | 'personal' | 'health' | 'learning' | string;
  
  status: TaskStatus;
  
  // Награда (оба варианта, чтобы код не падал)
  coin_value: number; 
  coins_reward?: number; 
  
  is_active: boolean;
  created_at: string;
  
  // Время и напоминания
  reminder_time?: string;
  due_time?: string;
}

// --- COMPLETED TASK ---
export interface CompletedTask {
  id: string;
  task_id: string;
  user_id: string;
  completed_at: string;
  coins_earned: number;
}

// --- TELEGRAM ---
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id: string;
    user: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string; // Добавлено
    };
    auth_date: string;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: any) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  close: () => void;
  ready: () => void;
  expand: () => void;
  showAlert: (message: string) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
}
