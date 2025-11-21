import React from 'react';
import { motion } from 'framer-motion';
import { getStreakMessage } from '@/lib/utils';

interface StreakBannerProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({
  currentStreak,
  longestStreak
}) => {
  const streakMessage = getStreakMessage(currentStreak);
  const showRecord = currentStreak === longestStreak && currentStreak > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl p-4 mb-4 text-center',
        currentStreak === 0
          ? 'bg-gray-100 text-gray-600'
          : currentStreak < 7
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : currentStreak < 30
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-purple-50 text-purple-700 border border-purple-200'
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 3 }}
          className="text-2xl"
        >
          {currentStreak === 0 ? '🌱' : '🔥'}
        </motion.span>

        <div>
          <div className="font-semibold text-sm">
            {currentStreak > 0 ? `${currentStreak} Day Streak!` : 'No Active Streak'}
          </div>
          <div className="text-xs opacity-80">
            {streakMessage}
            {showRecord && (
              <span className="ml-1">🏆 Personal Record!</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};