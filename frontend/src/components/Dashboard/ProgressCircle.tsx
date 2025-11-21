import React from 'react';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Coins, Trophy } from 'lucide-react';
import { formatCoins } from '@/lib/utils';

interface ProgressCircleProps {
  dailyProgress: number;
  weeklyProgress: number;
  currentStreak: number;
  coinsEarned: number;
  level: number;
  levelProgress: number;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  dailyProgress,
  weeklyProgress,
  currentStreak,
  coinsEarned,
  level
}) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        {/* Main daily progress circle */}
        <ProgressRing
          progress={dailyProgress}
          size={200}
          strokeWidth={12}
          color="#50C878"
          backgroundColor="#E5E7EB"
        >
          <div className="flex flex-col items-center justify-center text-center">
            {/* Main progress percentage */}
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {Math.round(dailyProgress)}%
            </div>
            <div className="text-sm text-gray-500 mb-3">Daily Goal</div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-gray-600">
              {/* Streak */}
              <div className="flex items-center gap-1">
                <span className="text-lg">🔥</span>
                <span className="font-medium">{currentStreak}</span>
              </div>

              {/* Coins */}
              <div className="flex items-center gap-1">
                <Coins size={12} className="text-amber-500" />
                <span className="font-medium">{formatCoins(coinsEarned)}</span>
              </div>

              {/* Level */}
              <div className="flex items-center gap-1">
                <Trophy size={12} className="text-purple-500" />
                <span className="font-medium">{level}</span>
              </div>
            </div>
          </div>
        </ProgressRing>

        {/* Weekly progress ring (smaller, outer) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ProgressRing
            progress={weeklyProgress}
            size={220}
            strokeWidth={4}
            color="#4A90E2"
            backgroundColor="#F3F4F6"
          />
        </div>

        {/* Weekly progress label */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
          Week: {Math.round(weeklyProgress)}%
        </div>
      </div>
    </div>
  );
};