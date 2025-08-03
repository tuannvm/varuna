#!/usr/bin/env ts-node

/**
 * Basic Usage Example
 * 
 * This example demonstrates how to use the Varuna monitoring system
 * to monitor cloud provider RSS feeds and analyze service status.
 */

import Phase0System from '../src/index';

async function basicUsageExample(): Promise<void> {
  console.log('🚀 Varuna Basic Usage Example\n');

  // Create a new Phase0System instance
  const system = new Phase0System();

  try {
    // Step 1: Initialize the system
    console.log('📋 Step 1: Initializing system...');
    await system.initialize();
    console.log('✅ System initialized successfully\n');

    // Step 2: Check system status before starting
    console.log('📊 Step 2: Checking system status...');
    const initialStatus = await system.getSystemStatus();
    console.log(`System running: ${initialStatus.system.isRunning}`);
    console.log(`Orchestrator ready: ${!initialStatus.agents.orchestrator.isRunning}`);
    console.log(`RSS Collector status: ${initialStatus.agents.collector.status}`);
    console.log(`Analysis Agent status: ${initialStatus.agents.analysis.status}\n`);

    // Step 3: Start the monitoring system
    console.log('🎬 Step 3: Starting monitoring system...');
    await system.start();
    console.log('✅ System started successfully\n');

    // Step 4: Let it run for a short period
    console.log('⏱️  Step 4: Running system for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Step 5: Check running status
    console.log('📈 Step 5: Checking running status...');
    const runningStatus = await system.getSystemStatus();
    console.log(`System uptime: ${runningStatus.system.uptime}ms`);
    console.log(`Cycles completed: ${runningStatus.system.cycleCount}`);
    console.log(`Currently running: ${runningStatus.system.isRunning}\n`);

    // Step 6: Stop the system
    console.log('🛑 Step 6: Stopping system...');
    await system.stop();
    console.log('✅ System stopped successfully\n');

    // Step 7: Final status check
    console.log('📊 Step 7: Final status check...');
    const finalStatus = await system.getSystemStatus();
    console.log(`Final cycle count: ${finalStatus.system.cycleCount}`);
    console.log(`System running: ${finalStatus.system.isRunning}\n`);

    console.log('🎉 Basic usage example completed successfully!');

  } catch (error) {
    console.error('❌ Example failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Example interrupted. Exiting...');
  process.exit(0);
});

if (require.main === module) {
  basicUsageExample().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export default basicUsageExample;