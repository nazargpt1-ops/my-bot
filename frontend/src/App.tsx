import React, { useEffect } from 'react';
import { DashboardScreen } from './components/Dashboard/DashboardScreen';
import { useAuthStore } from './store/useAuthStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import './index.css';

type ScreenType = 'dashboard' | 'create-task' | 'analytics' | 'achievements' | 'shop' | 'profile';

function App() {
  const { authenticate, isAuthenticated, user, isLoading } = useAuthStore();
  const [currentScreen, setCurrentScreen] = React.useState<ScreenType>('dashboard');

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigate={handleNavigate} />;
      case 'create-task':
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Create Task</h1>
              <p className="text-gray-600">Task creation screen coming soon...</p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Analytics</h1>
              <p className="text-gray-600">Analytics screen coming soon...</p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case 'achievements':
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Achievements</h1>
              <p className="text-gray-600">Achievements screen coming soon...</p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      case 'shop':
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Shop</h1>
              <p className="text-gray-600">Shop screen coming soon...</p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return <DashboardScreen onNavigate={handleNavigate} />;
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading HabitFlow...</p>
        </div>
      </div>
    );
  }

  // Authentication error or not available
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold mb-2">Welcome to HabitFlow</h1>
          <p className="text-gray-600 mb-4">
            A gamified task management app to help you build productive habits and achieve your goals.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
            <p>Please open this app through Telegram to get started.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl">
      {renderScreen()}
    </div>
  );
}

export default App;
