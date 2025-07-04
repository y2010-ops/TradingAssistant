import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Users, Globe, Zap } from 'lucide-react';

const QuickStats: React.FC = () => {
  const stats = [
    {
      title: 'Active Traders',
      value: '1,245',
      change: '+12%',
      positive: true,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Signals Generated',
      value: '89',
      change: '+5',
      positive: true,
      icon: Zap,
      color: 'green'
    },
    {
      title: 'Success Rate',
      value: '87.5%',
      change: '+2.1%',
      positive: true,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'Global Markets',
      value: '24/7',
      change: 'Live',
      positive: true,
      icon: Globe,
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="trading-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className={`text-sm font-medium ${
                stat.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-3">
              {stat.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuickStats;