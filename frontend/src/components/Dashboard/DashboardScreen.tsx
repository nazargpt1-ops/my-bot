import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AnimatePresence } from 'framer-motion';
import { Plus, Trophy, Flame, Coins } from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (screen: 'create-task' | 'analytics' | 'achievements' | 'shop' | 'profile') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { user, updateUserCoins } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Fetch active tasks for the user
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.user_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map DB fields to Task Interface
        const mappedTasks: Task[] = data.map((t: any) => ({
          id: t.task_id,
          user_id: t.user_id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          category: t.category,
          status: t.is_active ? 'pending' : 'completed',
          coins_reward: t.coin_value,
          created_at: t.created_at,
          due_time: t.due_time
        }));
        setTasks(mappedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    if (!user) return;
    setCompletingTaskId(task.id);

    try {
      // 1. Mark task as inactive in DB
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ is_active: false })
        .eq('task_id', task.id);

      if (updateError) throw updateError;

      // 2. Insert into completed_tasks to trigger DB logic (streaks, achievements)
      const { error: insertError } = await supabase
        .from('completed_tasks')
        .insert({
          user_id: user.user_id,
          task_id: task.id,
          completion_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          coins_earned: task.coins_reward
        });

      if (insertError) {
        console.error('Error logging completion:', insertError);
        // We continue anyway to update UI
      }

      // 3. Optimistic UI update
      setTasks(prev => prev.filter(t => t.id !== task.id));
      updateUserCoins(task.coins_reward);

      // 4. (Optional) Show success animation or toast here

    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task. Please try again.');
    } finally {
      setCompletingTaskId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Header Stats */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.username || 'Hero'}! 👋</h1>
            <p className="text-gray-500 text-sm">Let's crush some goals today.</p>
          </div>
          <div 
            onClick={() => onNavigate('profile')}
            className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-amber-50 p-3 rounded-2xl flex items-center gap-3 border border-amber-100">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <Coins size={20} />
            </div>
            <div>
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Coins</p>
              <p className="text-lg font-black text-gray-900">{user?.total_coins || 0}</p>
            </div>
          </div>
          <div className="flex-1 bg-blue-50 p-3 rounded-2xl flex items-center gap-3 border border-blue-100">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Streak</p>
              <p className="text-lg font-black text-gray-900">{user?.current_streak || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 mt-2">
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-lg font-bold text-gray-800">Your Tasks</h2>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
            {tasks.length} Pending
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              💤
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No tasks yet</h3>
            <p className="text-gray-500 text-sm mb-4">You're all caught up! Or maybe...</p>
            <button
              onClick={() => onNavigate('create-task')}
              className="text-primary font-medium text-sm hover:underline"
            >
              Add a new task
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                isCompleting={completingTaskId === task.id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => onNavigate('create-task')}
          className="bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
};
