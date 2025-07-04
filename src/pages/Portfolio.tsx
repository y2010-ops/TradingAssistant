import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Plus, Trash2, Edit3, Eye } from 'lucide-react';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  sector: string;
}

const Portfolio: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([
    {
      id: '1',
      symbol: 'RELIANCE',
      name: 'Reliance Industries',
      quantity: 50,
      avgPrice: 2350.00,
      currentPrice: 2456.75,
      invested: 117500,
      currentValue: 122837.50,
      pnl: 5337.50,
      pnlPercent: 4.54,
      sector: 'Energy'
    },
    {
      id: '2',
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      quantity: 25,
      avgPrice: 3400.00,
      currentPrice: 3234.50,
      invested: 85000,
      currentValue: 80862.50,
      pnl: -4137.50,
      pnlPercent: -4.87,
      sector: 'IT'
    },
    {
      id: '3',
      symbol: 'HDFCBANK',
      name: 'HDFC Bank',
      quantity: 75,
      avgPrice: 1450.00,
      currentPrice: 1567.25,
      invested: 108750,
      currentValue: 117543.75,
      pnl: 8793.75,
      pnlPercent: 8.09,
      sector: 'Banking'
    },
    {
      id: '4',
      symbol: 'INFY',
      name: 'Infosys',
      quantity: 40,
      avgPrice: 1500.00,
      currentPrice: 1432.80,
      invested: 60000,
      currentValue: 57312.00,
      pnl: -2688.00,
      pnlPercent: -4.48,
      sector: 'IT'
    },
    {
      id: '5',
      symbol: 'ITC',
      name: 'ITC Limited',
      quantity: 200,
      avgPrice: 420.00,
      currentPrice: 456.90,
      invested: 84000,
      currentValue: 91380.00,
      pnl: 7380.00,
      pnlPercent: 8.79,
      sector: 'FMCG'
    }
  ]);

  const totalInvested = holdings.reduce((sum, holding) => sum + holding.invested, 0);
  const totalCurrentValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPercent = (totalPnL / totalInvested) * 100;

  const sectorAllocation = holdings.reduce((acc, holding) => {
    const sector = holding.sector;
    if (!acc[sector]) {
      acc[sector] = { sector, value: 0, count: 0 };
    }
    acc[sector].value += holding.currentValue;
    acc[sector].count += 1;
    return acc;
  }, {} as Record<string, { sector: string; value: number; count: number }>);

  const sectorData = Object.values(sectorAllocation);
  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const topPerformers = [...holdings]
    .sort((a, b) => b.pnlPercent - a.pnlPercent)
    .slice(0, 5);

  const performanceData = [
    { month: 'Jan', value: 450000 },
    { month: 'Feb', value: 465000 },
    { month: 'Mar', value: 442000 },
    { month: 'Apr', value: 478000 },
    { month: 'May', value: 485000 },
    { month: 'Jun', value: totalCurrentValue }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your investments and performance
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Holding</span>
        </motion.button>
      </motion.div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="trading-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total Invested
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{totalInvested.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="trading-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Current Value
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{totalCurrentValue.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="trading-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${
              totalPnL >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {totalPnL >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Total P&L
          </h3>
          <p className={`text-2xl font-bold ${
            totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="trading-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${
              totalPnLPercent >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Returns
          </h3>
          <p className={`text-2xl font-bold ${
            totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="trading-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sector Allocation
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ sector, percent }) => `${sector} ${(percent * 100).toFixed(0)}%`}
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${(value as number).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="trading-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Portfolio Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${(value as number).toLocaleString()}`} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Holdings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="trading-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Holdings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Stock</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Qty</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Avg Price</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Current Price</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Invested</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Current Value</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">P&L</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, index) => (
                <motion.tr
                  key={holding.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {holding.symbol}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {holding.name}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                    {holding.quantity}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                    ₹{holding.avgPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                    ₹{holding.currentPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                    ₹{holding.invested.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                    ₹{holding.currentValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={`${
                      holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <div className="font-semibold">
                        {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toLocaleString()}
                      </div>
                      <div className="text-sm">
                        {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="trading-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topPerformers.map((stock, index) => (
            <div key={stock.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {stock.symbol}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stock.sector}
                  </p>
                </div>
                <div className={`flex items-center space-x-1 ${
                  stock.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.pnlPercent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">
                    {stock.pnlPercent >= 0 ? '+' : ''}{stock.pnlPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>P&L: <span className={`font-semibold ${
                  stock.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.pnl >= 0 ? '+' : ''}₹{stock.pnl.toLocaleString()}
                </span></p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Portfolio;