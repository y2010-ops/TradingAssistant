import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Brain, TrendingUp, MessageCircle, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI Trading Assistant. I can help you with stock analysis, market insights, trading strategies, and answer any questions about the Indian stock market. What would you like to know today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "What's the market sentiment today?",
    "Analyze RELIANCE stock",
    "Should I buy TCS shares?",
    "What are the top gainers today?",
    "Explain RSI indicator",
    "Market outlook for next week"
  ];

  const generateAIResponse = (userMessage: string): string => {
    const responses = {
      'market sentiment': "Current market sentiment is cautiously optimistic. The NIFTY 50 is showing resilience with banking and IT sectors leading gains. FII flows remain positive, and corporate earnings are beating expectations. However, global cues and inflation concerns are key watchpoints.",
      'reliance': "RELIANCE is showing strong technical momentum. Key levels: Support at ₹2,350, Resistance at ₹2,650. The stock has broken above its 20-day moving average with increasing volumes. Fundamentally, strong refining margins and digital business growth are positive catalysts.",
      'tcs': "TCS is consolidating in a narrow range. Q4 earnings are crucial - watch for revenue guidance and deal wins. Technical indicators suggest sideways movement with support at ₹3,100. The stock offers good dividend yield for long-term investors.",
      'rsi': "RSI (Relative Strength Index) measures momentum on a scale of 0-100. Above 70 indicates overbought conditions (potential sell signal), below 30 indicates oversold conditions (potential buy signal). It's most effective when combined with other indicators.",
      'gainers': "Today's top gainers include banking stocks like KOTAKBANK (+2.1%), HDFCBANK (+1.8%), and metal stocks like TATASTEEL (+3.2%). The banking sector is benefiting from RBI's stable policy stance.",
      'outlook': "Next week's outlook depends on global markets, FII flows, and corporate earnings. Key events: RBI policy commentary, Q4 earnings releases, and US Fed indicators. Sectors to watch: Banking, IT, and Auto."
    };

    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    return "I understand you're looking for market insights. Could you be more specific about which stock, sector, or market aspect you'd like me to analyze? I have comprehensive data on NSE/BSE stocks, technical indicators, and market trends.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputValue),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Trading Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Powered by advanced AI • Real-time market insights
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Messages */}
        <div className="flex-1 trading-card p-6 flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                    message.type === 'user' 
                      ? 'chat-message user' 
                      : 'chat-message ai'
                  }`}>
                    {message.type === 'ai' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="chat-message ai">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                  </div>
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about stocks, markets, or trading..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Quick Questions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="trading-card p-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Questions</h3>
            </div>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full p-2 text-left text-sm bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* AI Capabilities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="trading-card p-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Capabilities</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Stock Analysis</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Technical & fundamental analysis</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Market Insights</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Real-time market commentary</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Brain className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Trading Strategies</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Personalized recommendations</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Market Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="trading-card p-4"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Market Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">NIFTY 50</span>
                <span className="text-sm font-medium text-green-600">+1.21%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">SENSEX</span>
                <span className="text-sm font-medium text-green-600">+0.98%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bank Nifty</span>
                <span className="text-sm font-medium text-red-600">-0.35%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;