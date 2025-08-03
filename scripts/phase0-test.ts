#!/usr/bin/env ts-node

/**
 * Phase 0 Integration Test Script
 * 
 * This script runs a comprehensive test of the Phase 0 system
 * to validate the multi-agent architecture and RSS monitoring functionality.
 * 
 * Usage: npm run test:phase0
 */

import Phase0System from '../src/index';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

class Phase0TestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    console.log(`🧪 ${name}...`);
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({ name, passed: true, duration });
      console.log(`✅ ${name} (${duration}ms)\n`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({ name, passed: false, duration, error: errorMessage });
      console.log(`❌ ${name} - ${errorMessage} (${duration}ms)\n`);
    }
  }

  printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('📊 Test Summary:');
    console.log(`Tests: ${passed}/${total} passed`);
    console.log(`Duration: ${totalDuration}ms`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Phase 0 system is ready for deployment.');
    } else {
      console.log('❌ Some tests failed. Please review the results above.');
      process.exit(1);
    }
  }
}

async function main(): Promise<void> {
  console.log('🚀 Phase 0 TypeScript Integration Test Suite Starting...\n');
  
  const runner = new Phase0TestRunner();
  const system = new Phase0System();
  
  try {
    // Test 1: System Initialization
    await runner.runTest('System Initialization', async () => {
      await system.initialize();
    });

    // Test 2: Agent Status Check
    await runner.runTest('Agent Status Check', async () => {
      const status = await system.getSystemStatus();
      
      if (!status.agents.orchestrator) {
        throw new Error('Orchestrator agent not initialized');
      }
      if (!status.agents.collector) {
        throw new Error('RSS Collector agent not initialized');
      }
      if (!status.agents.analysis) {
        throw new Error('Analysis agent not initialized');
      }
      
      console.log(`   Orchestrator: ${status.agents.orchestrator.isRunning ? 'Running' : 'Ready'}`);
      console.log(`   RSS Collector: ${status.agents.collector.status}`);
      console.log(`   Analysis Agent: ${status.agents.analysis.status}`);
    });

    // Test 3: System Start/Stop
    await runner.runTest('System Start/Stop Cycle', async () => {
      await system.start();
      
      // Let system run for a short period
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const runningStatus = await system.getSystemStatus();
      if (!runningStatus.system.isRunning) {
        throw new Error('System should be running');
      }
      
      await system.stop();
      
      const stoppedStatus = await system.getSystemStatus();
      if (stoppedStatus.system.isRunning) {
        throw new Error('System should be stopped');
      }
    });

    // Test 4: Resource Cleanup
    await runner.runTest('Resource Cleanup', async () => {
      // Verify system can be restarted after stop
      await system.start();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await system.stop();
    });

    runner.printSummary();
    
  } catch (error) {
    console.error('💥 Test suite failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted. Cleaning up...');
  process.exit(0);
});

if (require.main === module) {
  main().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}