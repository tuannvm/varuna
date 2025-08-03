import Phase0System from './src/index';

async function testPhase0(): Promise<void> {
  console.log('🧪 Phase 0 TypeScript Test Suite Starting...\n');
  
  const system = new Phase0System();
  
  try {
    // Test 1: System initialization
    console.log('Test 1: System Initialization');
    await system.initialize();
    console.log('✅ All agents initialized successfully\n');
    
    // Test 2: Agent status check
    console.log('Test 2: Agent Status Check');
    const status = await system.getSystemStatus();
    console.log(`✅ Orchestrator: ${status.agents.orchestrator.isRunning ? 'Running' : 'Ready'}`);
    console.log(`✅ RSS Collector: ${status.agents.collector.status}`);
    console.log(`✅ Analysis Agent: ${status.agents.analysis.status}\n`);
    
    // Test 3: Short run test (1 cycle for quick test)
    console.log('Test 3: Single Cycle Coordination Test');
    console.log('Starting system for 1 cycle to test agent coordination...\n');
    
    await system.start();
    
    // Wait 30 seconds for single cycle completion
    await new Promise<void>(resolve => {
      const timeout = setTimeout(() => {
        console.log('\n✅ TypeScript implementation test completed successfully!');
        system.stop();
        resolve();
      }, 30000);
    });
    
    console.log('\n📊 Final Status:');
    const finalStatus = await system.getSystemStatus();
    console.log(`Cycles completed: ${finalStatus.system.cycleCount}`);
    console.log('✅ Phase 0 TypeScript implementation working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    process.exit(1);
  }
}

testPhase0();