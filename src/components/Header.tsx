import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Menu, Wifi, WifiOff, Settings, Bell, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../stores/themeStore';
import UserMenu from './UserMenu';
import { BarChart2 } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

// Stable market status calculation outside component
const calculateMarketStatus = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  const preMarketStart = 9 * 60; // 9:00 AM

  if (currentTime >= preMarketStart && currentTime < marketOpen) {
    return { status: 'Pre-Market', class: 'market-status-pre' };
  } else if (currentTime >= marketOpen && currentTime < marketClose) {
    return { status: 'Market Open', class: 'market-status-open' };
  } else {
    return { status: 'Market Closed', class: 'market-status-closed' };
  }
};

const Header: React.FC<HeaderProps> = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  connectionStatus 
}) => {
  const { theme, toggleTheme } = useThemeStore();
  
  // Stable market status that only updates when it actually changes
  const [marketStatus, setMarketStatus] = useState(() => calculateMarketStatus());

  // Memoize the connection icon to prevent re-renders
  const connectionIcon = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-5 h-5 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      default:
        return <Wifi className="w-5 h-5 text-yellow-500" />;
    }
  }, [connectionStatus]);

  // Stable sidebar toggle function
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  // Stable theme toggle function
  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // Update market status only when it actually changes (every minute)
  useEffect(() => {
    const updateMarketStatus = () => {
      const newStatus = calculateMarketStatus();
      setMarketStatus(prevStatus => {
        // Only update if status actually changed
        if (prevStatus.status !== newStatus.status) {
          return newStatus;
        }
        return prevStatus;
      });
    };

    // Check every minute for status changes
    const interval = setInterval(updateMarketStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 lg:mr-2"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span> Trading Assistant
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                NSE/BSE Real-time Analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Market Status - Stable, no motion */}
          <AnimatePresence mode="wait">
            <motion.div
              key={marketStatus.status}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-500 ease-in-out ${marketStatus.class}`}
            >
              {marketStatus.status}
            </motion.div>
          </AnimatePresence>

          {/* Connection Status - Stable */}
          <div className="flex items-center space-x-2">
            <div className="transition-colors duration-300">
              {connectionIcon}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize transition-colors duration-300">
              {connectionStatus}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative group"
          >
            <span className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition duration-200"></span>
            <span className="relative">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative group">
            <span className="absolute -inset-1 bg-gradient-to-r from-red-400/30 to-pink-400/30 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition duration-200"></span>
            <span className="relative">
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                3
              </span>
            </span>
          </button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(Header);