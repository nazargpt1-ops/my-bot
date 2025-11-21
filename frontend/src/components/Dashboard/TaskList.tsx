import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle } from 'lucide-react';
import { Task } from '@/types';
import { TaskCard } from '@/components/ui/TaskCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface TaskListProps {
  tasks: Task[];
  completedTaskIds: Set<string>;
  onTaskComplete: (taskId: string) => void;
  onAddTask: () => void;
  isLoading: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  completedTaskIds,
  onTaskComplete,
  onAddTask,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const completedTasks = tasks.filter(task => completedTaskIds.has(task.task_id));
  const pendingTasks = tasks.filter(task => !completedTaskIds.has(task.task_id));

  return (
    <div className="space-y-4">
      {/* Add task button */}
      <div className="flex justify-center">
        <Button
          onClick={onAddTask}
          variant="accent"
          size="lg"
          haptic="medium"
          className="w-full max-w-xs shadow-lg"
        >
          <Plus size={20} className="mr-2" />
          Add New Task
        </Button>
      </div>

      {/* Task stats */}
      <div className="flex justify-center gap-6 text-sm text-gray-600">
        <div className="text-center">
          <div className="font-semibold text-lg text-primary">{pendingTasks.length}</div>
          <div className="text-xs">To Do</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg text-success">{completedTasks.length}</div>
          <div className="text-xs">Done</div>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {/* Pending tasks first */}
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-1">
                Today's Tasks
              </h3>
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.task_id}
                  task={task}
                  onComplete={onTaskComplete}
                  isCompleted={false}
                />
              ))}
            </div>
          )}

          {/* Completed tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider px-1 flex items-center gap-2">
                <CheckCircle size={14} className="text-success" />
                Completed
              </h3>
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.task_id}
                  task={task}
                  onComplete={onTaskComplete}
                  isCompleted={true}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks yet
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Start building productive habits by adding your first task!
              </p>
              <Button onClick={onAddTask} variant="primary" haptic="light">
                <Plus size={16} className="mr-2" />
                Create Your First Task
              </Button>
            </motion.div>
          )}

          {/* All tasks completed */}
          {pendingTasks.length === 0 && completedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All tasks completed!
              </h3>
              <p className="text-sm text-gray-500">
                Great job! You've crushed today's goals!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};