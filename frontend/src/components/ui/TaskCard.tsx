import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Trophy } from 'lucide-react';
import { Task } from '@/types';
import { getCategoryIcon, getCategoryColor, getPriorityColor, formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  isCompleted?: boolean;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  isCompleted = false,
  className
}) => {
  const handleComplete = () => {
    if (onComplete && !isCompleted) {
      onComplete(task.task_id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'task-card cursor-pointer',
        isCompleted && 'opacity-75',
        className
      )}
      onClick={handleComplete}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleComplete();
          }}
          className={cn(
            'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
            isCompleted
              ? 'bg-success border-success text-white'
              : 'border-gray-300 hover:border-primary'
          )}
        >
          {isCompleted && <Check size={12} />}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-medium text-sm truncate',
                isCompleted && 'line-through text-gray-500'
              )}>
                {task.title}
              </h3>

              {task.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                {/* Category */}
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getCategoryColor(task.category)}20`,
                    color: getCategoryColor(task.category)
                  }}
                >
                  <span>{getCategoryIcon(task.category)}</span>
                  <span className="capitalize">{task.category}</span>
                </div>

                {/* Priority indicator */}
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                />

                {/* Time indicators */}
                {task.reminder_time && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={10} />
                    <span>{formatTime(task.reminder_time)}</span>
                  </div>
                )}

                {/* Coin reward */}
                <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
                  <Trophy size={10} />
                  <span>{task.coin_value}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};