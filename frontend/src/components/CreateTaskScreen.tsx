import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

// ВОТ ЭТОГО НЕ ХВАТАЛО:
interface CreateTaskScreenProps {
  onBack: () => void;
}

export const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        // coin_value считается сам в базе, либо можно добавить тут
      });

      if (error) throw error;
      onBack(); // Возвращаемся назад после успеха
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-6 flex items-center">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200">
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-2 text-2xl font-bold">New Habit</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            required
            type="text"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="e.g., Read 30 minutes"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <div className="grid grid-cols-2 gap-3">
            {['work', 'personal', 'health', 'learning'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`p-3 rounded-xl border capitalize ${
                  formData.category === cat
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full p-3 bg-white border border-gray-300 rounded-xl"
          >
            <option value="low">Low (Easy)</option>
            <option value="medium">Medium</option>
            <option value="high">High (Hard)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {loading ? 'Saving...' : 'Create Habit'}
        </button>
      </form>
    </div>
  );
};
