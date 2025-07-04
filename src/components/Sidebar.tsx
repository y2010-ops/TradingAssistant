import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  MessageCircle, 
  TrendingUp, 
  Heart, 
  Settings, 
  BookOpen,
  Target,
  PieChart,
  X
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Market Overview' },
  { id: 'analysis', label: 'Stock Analysis', icon: TrendingUp, description: 'Technical & Fundamental' },
  { id: 'chat', label: 'AI Assistant', icon: MessageCircle, description: 'Trading Advisor' },
  { id: 'sentiment', label: 'Sentiment', icon: Heart, description: 'Market Sentiment' },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart, description: 'Your Holdings' },
  { id: 'signals', label: 'Signals', icon: Target, description: 'Trading Signals' },
  { id: 'education', label: 'Education', icon: BookOpen, description: 'Learning Hub' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-70 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto custom-scrollbar"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Navigation
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
          <h3 className="font-semibold mb-2">Market Insights</h3>
          <p className="text-sm opacity-90 mb-3">
            Get AI-powered analysis and recommendations
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            Upgrade to Pro
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;