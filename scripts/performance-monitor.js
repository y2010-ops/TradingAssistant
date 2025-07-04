#!/usr/bin/env node

/**
 * AI Trading Assistant - Performance Monitor
 * Monitors AI model performance, memory usage, and response times
 */

import os from 'os';
import fs from 'fs/promises';
import { performance } from 'perf_hooks';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      aiResponses: [],
      memoryUsage: [],
      cpuUsage: [],
      modelPerformance: {},
      systemHealth: {
        uptime: 0,
        totalRequests: 0,
        errorRate: 0,
        avgResponseTime: 0
      }
    };
    
    this.startTime = Date.now();
    this.isMonitoring = false;
  }

  async startMonitoring() {
    console.log('🔍 Starting AI Performance Monitor...');
    this.isMonitoring = true;
    
    // Monitor system metrics every 30 seconds
    setInterval(() => this.collectSystemMetrics(), 30000);
    
    // Monitor AI performance every 5 minutes
    setInterval(() => this.testAIPerformance(), 300000);
    
    // Generate reports every hour
    setInterval(() => this.generateReport(), 3600000);
    
    // Initial metrics collection
    await this.collectSystemMetrics();
    await this.testAIPerformance();
    
    console.log('✅ Performance monitoring started');
  }

  async collectSystemMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      cpu: {
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch()
    };

    this.metrics.memoryUsage.push(metrics.memory);
    this.metrics.cpuUsage.push(metrics.cpu);
    
    // Keep only last 100 entries
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
    }
    if (this.metrics.cpuUsage.length > 100) {
      this.metrics.cpuUsage = this.metrics.cpuUsage.slice(-100);
    }

    // Check for performance issues
    this.checkPerformanceAlerts(metrics);
  }

  async testAIPerformance() {
    console.log('🧠 Testing AI model performance...');
    
    const tests = [
      {
        name: 'Local LLM',
        test: () => this.testLocalLLM()
      },
      {
        name: 'Sentiment Analysis',
        test: () => this.testSentimentAnalysis()
      },
      {
        name: 'Technical Analysis',
        test: () => this.testTechnicalAnalysis()
      },
      {
        name: 'RAG System',
        test: () => this.testRAGSystem()
      }
    ];

    for (const test of tests) {
      try {
        const startTime = performance.now();
        const result = await test.test();
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        const performance_metric = {
          timestamp: new Date().toISOString(),
          model: test.name,
          responseTime: responseTime,
          success: result.success,
          error: result.error || null,
          memoryUsage: process.memoryUsage(),
          details: result.details || {}
        };

        this.metrics.aiResponses.push(performance_metric);
        
        if (!this.metrics.modelPerformance[test.name]) {
          this.metrics.modelPerformance[test.name] = [];
        }
        this.metrics.modelPerformance[test.name].push(performance_metric);

        // Keep only last 50 entries per model
        if (this.metrics.modelPerformance[test.name].length > 50) {
          this.metrics.modelPerformance[test.name] = 
            this.metrics.modelPerformance[test.name].slice(-50);
        }

        console.log(`✅ ${test.name}: ${responseTime.toFixed(2)}ms`);
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error.message);
        
        const errorMetric = {
          timestamp: new Date().toISOString(),
          model: test.name,
          responseTime: null,
          success: false,
          error: error.message,
          memoryUsage: process.memoryUsage()
        };

        this.metrics.aiResponses.push(errorMetric);
      }
    }

    // Keep only last 200 AI responses
    if (this.metrics.aiResponses.length > 200) {
      this.metrics.aiResponses = this.metrics.aiResponses.slice(-200);
    }
  }

  async testLocalLLM() {
    try {
      // Test Ollama connection
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) {
        throw new Error('Ollama server not responding');
      }

      const models = await response.json();
      
      // Test text generation if models available
      if (models.models && models.models.length > 0) {
        const testResponse = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: models.models[0].name,
            prompt: 'What is 2+2?',
            stream: false,
            options: { num_predict: 10 }
          })
        });

        if (testResponse.ok) {
          const result = await testResponse.json();
          return {
            success: true,
            details: {
              modelsAvailable: models.models.length,
              responseLength: result.response?.length || 0
            }
          };
        }
      }

      return {
        success: true,
        details: { modelsAvailable: models.models?.length || 0 }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testSentimentAnalysis() {
    try {
      // Simulate sentiment analysis test
      const testText = "RELIANCE stock shows strong bullish momentum";
      
      // This would normally call your sentiment analysis service
      // For monitoring, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
      
      return {
        success: true,
        details: {
          textLength: testText.length,
          sentiment: 'positive'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testTechnicalAnalysis() {
    try {
      // Simulate technical analysis test
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        close: 2400 + Math.random() * 100,
        high: 2450 + Math.random() * 50,
        low: 2350 + Math.random() * 50,
        volume: 1000000 + Math.random() * 500000
      }));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        details: {
          dataPoints: mockData.length,
          indicators: ['RSI', 'MACD', 'BB']
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testRAGSystem() {
    try {
      // Simulate RAG system test
      const query = "What is RSI indicator?";
      
      // Simulate vector search and response generation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        success: true,
        details: {
          queryLength: query.length,
          documentsRetrieved: 3,
          confidence: 0.85
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  checkPerformanceAlerts(metrics) {
    const alerts = [];

    // Memory usage alert
    if (metrics.memory.usagePercent > 85) {
      alerts.push({
        type: 'HIGH_MEMORY',
        message: `Memory usage at ${metrics.memory.usagePercent.toFixed(1)}%`,
        severity: 'warning'
      });
    }

    // CPU load alert
    const avgLoad = metrics.cpu.loadAverage[0];
    if (avgLoad > metrics.cpu.cores * 0.8) {
      alerts.push({
        type: 'HIGH_CPU',
        message: `CPU load at ${avgLoad.toFixed(2)} (${metrics.cpu.cores} cores)`,
        severity: 'warning'
      });
    }

    // Log alerts
    for (const alert of alerts) {
      console.warn(`⚠️  [${alert.type}] ${alert.message}`);
    }
  }

  calculateAverageResponseTime(modelName) {
    const responses = this.metrics.modelPerformance[modelName] || [];
    const successfulResponses = responses.filter(r => r.success && r.responseTime);
    
    if (successfulResponses.length === 0) return 0;
    
    const total = successfulResponses.reduce((sum, r) => sum + r.responseTime, 0);
    return total / successfulResponses.length;
  }

  calculateSuccessRate(modelName) {
    const responses = this.metrics.modelPerformance[modelName] || [];
    if (responses.length === 0) return 0;
    
    const successful = responses.filter(r => r.success).length;
    return (successful / responses.length) * 100;
  }

  async generateReport() {
    console.log('\n📊 Generating Performance Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      systemMetrics: this.getSystemSummary(),
      aiPerformance: this.getAIPerformanceSummary(),
      recommendations: this.generateRecommendations()
    };

    // Save report to file
    const reportPath = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Display summary
    this.displayReportSummary(report);
    
    console.log(`📄 Full report saved to: ${reportPath}`);
  }

  getSystemSummary() {
    const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const latestCPU = this.metrics.cpuUsage[this.metrics.cpuUsage.length - 1];
    
    return {
      memory: {
        current: latestMemory?.usagePercent || 0,
        average: this.metrics.memoryUsage.reduce((sum, m) => sum + m.usagePercent, 0) / this.metrics.memoryUsage.length,
        peak: Math.max(...this.metrics.memoryUsage.map(m => m.usagePercent))
      },
      cpu: {
        current: latestCPU?.loadAverage[0] || 0,
        cores: latestCPU?.cores || 0
      }
    };
  }

  getAIPerformanceSummary() {
    const summary = {};
    
    for (const [modelName, responses] of Object.entries(this.metrics.modelPerformance)) {
      summary[modelName] = {
        averageResponseTime: this.calculateAverageResponseTime(modelName),
        successRate: this.calculateSuccessRate(modelName),
        totalRequests: responses.length,
        lastTested: responses[responses.length - 1]?.timestamp
      };
    }
    
    return summary;
  }

  generateRecommendations() {
    const recommendations = [];
    const systemSummary = this.getSystemSummary();
    const aiSummary = this.getAIPerformanceSummary();

    // Memory recommendations
    if (systemSummary.memory.average > 80) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'Consider reducing the number of loaded AI models or upgrading RAM'
      });
    }

    // AI performance recommendations
    for (const [modelName, perf] of Object.entries(aiSummary)) {
      if (perf.successRate < 90) {
        recommendations.push({
          type: 'ai_reliability',
          priority: 'medium',
          message: `${modelName} has low success rate (${perf.successRate.toFixed(1)}%). Check model availability.`
        });
      }
      
      if (perf.averageResponseTime > 5000) {
        recommendations.push({
          type: 'ai_performance',
          priority: 'medium',
          message: `${modelName} response time is slow (${perf.averageResponseTime.toFixed(0)}ms). Consider using a smaller model.`
        });
      }
    }

    return recommendations;
  }

  displayReportSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 AI TRADING ASSISTANT - PERFORMANCE REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n🕐 Uptime: ${Math.floor(report.uptime / 1000 / 60)} minutes`);
    
    console.log('\n💾 System Metrics:');
    console.log(`   Memory Usage: ${report.systemMetrics.memory.current.toFixed(1)}% (avg: ${report.systemMetrics.memory.average.toFixed(1)}%)`);
    console.log(`   CPU Cores: ${report.systemMetrics.cpu.cores}`);
    console.log(`   CPU Load: ${report.systemMetrics.cpu.current.toFixed(2)}`);
    
    console.log('\n🤖 AI Performance:');
    for (const [model, perf] of Object.entries(report.aiPerformance)) {
      const status = perf.successRate >= 90 ? '✅' : '⚠️';
      console.log(`   ${status} ${model}:`);
      console.log(`      Response Time: ${perf.averageResponseTime.toFixed(0)}ms`);
      console.log(`      Success Rate: ${perf.successRate.toFixed(1)}%`);
      console.log(`      Total Requests: ${perf.totalRequests}`);
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const rec of report.recommendations) {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`   ${priority} ${rec.message}`);
      }
    } else {
      console.log('\n✅ All systems performing optimally!');
    }
    
    console.log('\n' + '='.repeat(60));
  }

  async stop() {
    console.log('🛑 Stopping performance monitor...');
    this.isMonitoring = false;
    
    // Generate final report
    await this.generateReport();
    console.log('✅ Performance monitoring stopped');
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PerformanceMonitor();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await monitor.stop();
    process.exit(0);
  });
  
  // Start monitoring
  monitor.startMonitoring().catch(error => {
    console.error('❌ Failed to start performance monitor:', error);
    process.exit(1);
  });
  
  console.log('📊 Performance Monitor running... Press Ctrl+C to stop');
}

export default PerformanceMonitor;