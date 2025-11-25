// frontend/src/types/index.ts

// Интерфейс пользователя (собрал все варианты полей)
export interface User {
  id: string;
  user_id?: string; // Код иногда ищет это поле
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  
  coins: number;
  total_coins?: number; // Добавил, так как код просит
  
  streak_days: number;
  current_streak?: number; // Добавил
  
  level: number;
  created_at: string;
  
  avatar_url?: string; // Добавил
  photo_url?: string;  // Добавил
}

export type TaskStatus = 'pending' | 'completed'; 

// Интерфейс задачи (собрал все варианты полей)
export interface Task {
  id: string;
  task_id?: string; // Для совместимости
  user_id: string;
  
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'health' | 'learning';
  
  status: TaskStatus | string; 
  
  // Разные варианты монет и награды
  coin_value: number; 
  coins_reward?: number; 
  
  is_active: boolean;
  created_at: string;
  
  reminder_time?: string;
  due_time?: string; // Добавил
}

export interface CompletedTask {
  id: string;
  task_id: string;
  user_id: string;
  completed_at: string;
  coins_earned: number;
}

// Ответ от API (добавил success)
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success?: boolean; // <-- Это поле вызывало кучу ошибок в auth.ts
}

// Типы для Telegram (обновленные с photo_url)
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
      photo_url?: string; // Добавил, чтобы auth.ts не ругался
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
