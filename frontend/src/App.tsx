import React, { useEffect } from 'react';
import { DashboardScreen } from './components/Dashboard/DashboardScreen';
import { CreateTaskScreen } from './components/CreateTaskScreen';
import { useAuthStore } from './store/useAuthStore';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import './index.css';

type ScreenType = 'dashboard' | 'create-task' | 'analytics' | 'achievements' | 'shop' | 'profile';

function App() {
  const { authenticate, isAuthenticated, isLoading } = useAuthStore();
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
        return <CreateTaskScreen onNavigate={handleNavigate} />;
      case 'analytics':
        return <PlaceholderScreen title="Analytics" onBack={() => handleNavigate('dashboard')} />;
      case 'achievements':
        return <PlaceholderScreen title="Achievements" onBack={() => handleNavigate('dashboard')} />;
      case 'shop':
        return <PlaceholderScreen title="Shop" onBack={() => handleNavigate('dashboard')} />;
      case 'profile':
        return <PlaceholderScreen title="Profile" onBack={() => handleNavigate('dashboard')} />;
      default:
        return <DashboardScreen onNavigate={handleNavigate} />;
    }
  };

  
  // Loading screen
  if (false) {
       return ...
       }

  // Not Authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
         <div className="text-center max-w-sm">
            <div className="text-6xl mb-6">🎯</div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">HabitFlow</h1>
            <p className="text-gray-500 mb-6">Authentication failed. Please open this app via Telegram.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium"
            >
              Retry
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-2xl overflow-hidden">
      {renderScreen()}
    </div>
  );
}

// Helper for placeholder screens
const PlaceholderScreen = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="min-h-screen bg-white flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500 mb-6">This feature is coming soon...</p>
      <button
        onClick={onBack}
        className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
      >
        Back to Dashboard
      </button>
    </div>
  </div>
);

export default App;
