import React, { useEffect } from 'react';
import { DashboardScreen } from './components/Dashboard/DashboardScreen';
import { CreateTaskScreen } from './components/CreateTaskScreen';
import { useAuthStore } from './store/useAuthStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import './index.css';

type ScreenType = 'dashboard' | 'create-task' | 'analytics' | 'achievements' | 'shop' | 'profile';

function App() {
  const { authenticate } = useAuthStore();
  const [currentScreen, setCurrentScreen] = React.useState<ScreenType>('dashboard');

  // Мы запускаем аутентификацию, но не блокируем экран, пока она идет
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
        return <CreateTaskScreen onBack={() => handleNavigate('dashboard')} />;
      case 'analytics':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Analytics</h1>
              <p className="text-gray-600">Coming soon...</p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Back
              </button>
            </div>
          </div>
        );
      default:
        // По умолчанию показываем дашборд или заглушку для других экранов
        return (
           <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">{currentScreen}</h1>
              <p className="text-gray-600">Coming soon...</p>
              <button
                onClick={() => handleNavigate('dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Back
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-xl overflow-hidden">
      {renderScreen()}
    </div>
  );
}

export default App;
