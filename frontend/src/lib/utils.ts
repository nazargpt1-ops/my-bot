import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Utility functions for the app
export const formatCoins = (coins: number): string => {
  return coins.toLocaleString();
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getCategoryColor = (category: string): string => {
  const colors = {
    sport: '#FF6B6B',
    health: '#48DBFB',
    work: '#FFB347',
    learning: '#50C878',
    rest: '#DDA0DD',
    personal: '#9B7EDE'
  };
  return colors[category as keyof typeof colors] || '#6B7280';
};

export const getCategoryIcon = (category: string): string => {
  const icons = {
    sport: '💪',
    health: '❤️',
    work: '💼',
    learning: '📚',
    rest: '🧘',
    personal: '⭐'
  };
  return icons[category as keyof typeof icons] || '📌';
};

export const getPriorityColor = (priority: string): string => {
  const colors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444'
  };
  return colors[priority as keyof typeof colors] || '#6B7280';
};

export const calculateLevelProgress = (currentXP: number, level: number): number => {
  // XP required for next level: level * 100
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpGainedInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededInCurrentLevel = xpForNextLevel - xpForCurrentLevel;

  return Math.min(100, Math.max(0, (xpGainedInCurrentLevel / xpNeededInCurrentLevel) * 100));
};

export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return 'Great start! Keep it going!';
  if (streak < 7) return `${streak} day streak! You're on fire! 🔥`;
  if (streak < 30) return `${streak} day streak! Week warrior! 💪`;
  if (streak < 100) return `${streak} day streak! Month master! 🏆`;
  return `${streak} day streak! Legendary! 🌟`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Animation utilities
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};