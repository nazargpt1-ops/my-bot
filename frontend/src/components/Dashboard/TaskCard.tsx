import React from 'react';
import { Task } from '../../types';
import { Check, Clock, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onComplete: (task: Task) => void;
  isCompleting: boolean;
}

const priorityColors = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-red-100 text-red-700 border-red-200',
};

const categoryIcons: Record<string, string> = {
  work: '💼',
  personal: '👤',
  health: '❤️',
  learning: '📚',
  sport: '⚽',
  rest: '🛌',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, isCompleting }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3 relative overflow-hidden ${
        isCompleting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl" role="img" aria-label={task.category}>
              {categoryIcons[task.category] || '📌'}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>
          
          <h3 className="font-bold text-gray-800 leading-tight mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-gray-500 text-sm line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
              <Coins size={12} />
              <span>+{task.coins_reward}</span>
            </div>
            {task.due_time && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{task.due_time}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onComplete(task)}
          disabled={isCompleting}
          className="h-10 w-10 flex-shrink-0 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-300 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all active:scale-95"
        >
          <Check size={20} />
        </button>
      </div>
    </motion.div>
  );
};
