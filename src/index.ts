import OrchestratorAgent from './agents/orchestrator';
import RSSCollectorAgent from './agents/rssCollector';
import AnalysisAgent from './agents/analysisAgent';
import logger from './utils/logger';
import { SystemStatus } from './types';
import * as fs from 'fs';
import * as path from 'path';

class Phase0System {
  private orchestrator: OrchestratorAgent;
  private rssCollector: RSSCollectorAgent;
  private analysisAgent: AnalysisAgent;
  private isRunning: boolean;
  private cycleCount: number;
  private startTime: Date | null;
  private statusInterval: NodeJS.Timeout | null;

  constructor() {
    this.orchestrator = new OrchestratorAgent();
    this.rssCollector = new RSSCollectorAgent();
    this.analysisAgent = new AnalysisAgent();
    this.isRunning = false;
    this.cycleCount = 0;
    this.startTime = null;
    this.statusInterval = null;
  }

  async initialize(): Promise<void> {
    try {
      // Ensure logs directory exists
      const logsDir = path.join(__dirname, '../logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      logger.logAgentAction('system', 'initialization_started');

      // Initialize all agents
      await this.orchestrator.initialize();
      await this.rssCollector.initialize();
      await this.analysisAgent.initialize();

      // Start result processing
      await this.orchestrator.processResults();

      logger.logAgentAction('system', 'initialization_complete');
      
    } catch (error) {
      logger.logError('system', error as Error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('System is already running');
      return;
    }

    try {
      this.isRunning = true;
      this.startTime = new Date();
      this.cycleCount = 0;

      logger.logAgentAction('system', 'system_started');
      console.log('🚀 Phase 0 Multi-Agent RSS Monitoring System Started');
      console.log('📊 Target: 48 data cycles (12 hours) for stability test');
      console.log('⏱️  Collection interval: 15 minutes');
      console.log('🤖 Agents: Orchestrator, RSS Collector, Analysis Agent');

      // Start the orchestrator scheduling
      await this.orchestrator.startScheduling();

      // Monitor system status
      this.statusInterval = setInterval(() => {
        this.logSystemStatus();
      }, 5 * 60 * 1000); // Every 5 minutes

      // Monitor for 48 cycles completion
      this.monitorCompletion();

    } catch (error) {
      logger.logError('system', error as Error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('System is not running');
      return;
    }

    try {
      this.isRunning = false;
      
      await this.orchestrator.stopScheduling();
      
      if (this.statusInterval) {
        clearInterval(this.statusInterval);
        this.statusInterval = null;
      }

      const duration = this.startTime ? new Date().getTime() - this.startTime.getTime() : 0;
      const hours = Math.floor(duration / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

      logger.logAgentAction('system', 'system_stopped', {
        totalCycles: this.cycleCount,
        durationHours: hours,
        durationMinutes: minutes
      });

      console.log(`\n🛑 System stopped after ${hours}h ${minutes}m`);
      console.log(`📈 Completed ${this.cycleCount} cycles`);
      
    } catch (error) {
      logger.logError('system', error as Error);
      throw error;
    }
  }

  private logSystemStatus(): void {
    if (!this.startTime) return;
    
    const uptime = new Date().getTime() - this.startTime.getTime();
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    
    const status = {
      uptime: `${hours}h ${minutes}m`,
      cycles: this.cycleCount,
      targetCycles: 48,
      progress: `${Math.round((this.cycleCount / 48) * 100)}%`
    };

    logger.logAgentAction('system', 'status_update', status);
    console.log(`📊 Status: ${status.cycles}/48 cycles (${status.progress}) - Uptime: ${status.uptime}`);
  }

  private monitorCompletion(): void {
    const checkInterval = setInterval(() => {
      if (this.cycleCount >= 48) {
        console.log('\n🎉 SUCCESS: Completed 48 data cycles!');
        console.log('✅ Phase 0 stability test passed');
        
        logger.logAgentAction('system', 'phase0_success', {
          totalCycles: this.cycleCount,
          targetAchieved: true,
          duration: this.startTime ? new Date().getTime() - this.startTime.getTime() : 0
        });
        
        clearInterval(checkInterval);
        this.stop();
      }
    }, 30000); // Check every 30 seconds
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const orchestratorStatus = await this.orchestrator.getStatus();
    const collectorStatus = await this.rssCollector.getStatus();
    const analysisStatus = await this.analysisAgent.getStatus();

    return {
      system: {
        isRunning: this.isRunning,
        startTime: this.startTime,
        cycleCount: this.cycleCount,
        uptime: this.startTime ? new Date().getTime() - this.startTime.getTime() : 0
      },
      agents: {
        orchestrator: orchestratorStatus,
        collector: collectorStatus,
        analysis: analysisStatus
      }
    };
  }
}

// CLI interface
async function main(): Promise<void> {
  const system = new Phase0System();
  
  try {
    await system.initialize();
    
    const command = process.argv[2];
    
    switch (command) {
      case 'start':
        await system.start();
        break;
        
      case 'status':
        const status = await system.getSystemStatus();
        console.log(JSON.stringify(status, null, 2));
        break;
        
      default:
        console.log('Usage: npm run dev [start|status]');
        console.log('  start  - Start the Phase 0 monitoring system');
        console.log('  status - Show current system status');
    }
    
  } catch (error) {
    console.error('System error:', (error as Error).message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  main();
}

export default Phase0System;