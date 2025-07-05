import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './components/auth/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StockAnalysis from './pages/StockAnalysis';
import ChatAssistant from './pages/ChatAssistant';
import Sentiment from './pages/Sentiment';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import { useThemeStore } from './stores/themeStore';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const pages = {
  dashboard: Dashboard,
  analysis: StockAnalysis,
  chat: ChatAssistant,
  sentiment: Sentiment,
  portfolio: Portfolio,
  settings: Settings,
};

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useThemeStore();
  const { connected, connectionStatus } = useWebSocket();

  useEffect(() => {
    console.log('App component mounted');
    console.log('Theme:', theme);
    console.log('Connection status:', connectionStatus);
    
    // Apply theme class to document root
    document.documentElement.className = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme, connectionStatus]);

  const ActivePageComponent = pages[activePage as keyof typeof pages];

  console.log('Rendering App component');
  console.log('Active page:', activePage);
  console.log('Sidebar open:', sidebarOpen);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${theme}`}>
          <ProtectedRoute>
            <Header 
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              connectionStatus={connectionStatus}
            />
        
            <div className="flex">
              <AnimatePresence mode="wait">
                {sidebarOpen && (
                  <motion.div
                    initial={{ x: -280 }}
                    animate={{ x: 0 }}
                    exit={{ x: -280 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed left-0 top-16 z-40 w-70 h-[calc(100vh-4rem)]"
                  >
                    <Sidebar 
                      activePage={activePage}
                      setActivePage={setActivePage}
                      onClose={() => setSidebarOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <main className={`flex-1 transition-all duration-300 ${
                sidebarOpen ? 'ml-70' : 'ml-0'
              } pt-16`}>
                <div className="p-6 max-w-full">
                  <motion.div
                    key={activePage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ActivePageComponent />
                  </motion.div>
                </div>
              </main>
            </div>
          </ProtectedRoute>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
            }}
          />
        </div>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;