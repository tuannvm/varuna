import { Agent } from '@openai/agents';
import config from '../config';
import logger from '../utils/logger';
import messageQueue from '../utils/messageQueue';
import { AgentMessage, AgentResult } from '../types';

interface OrchestratorStatus {
  isRunning: boolean;
  activeTasks: string[];
  cycleCount: number;
}

class OrchestratorAgent extends Agent {
  private isRunning: boolean;
  private scheduledTasks: Map<string, NodeJS.Timeout>;
  private cycleCount: number;

  constructor() {
    super({
      name: 'orchestrator'
    });
    
    this.isRunning = false;
    this.scheduledTasks = new Map();
    this.cycleCount = 0;
  }

  async initialize(): Promise<void> {
    await messageQueue.initialize();
    logger.logAgentAction('orchestrator', 'initialized');
  }

  async startScheduling(): Promise<void> {
    if (this.isRunning) {
      logger.logAgentAction('orchestrator', 'already_running');
      return;
    }

    this.isRunning = true;
    const correlationId = logger.logAgentAction('orchestrator', 'scheduling_started');
    
    // Schedule RSS collection every 15 minutes
    const intervalId = setInterval(() => {
      this.scheduleRSSCollection();
    }, config.scheduling.rssCollectionIntervalMs);

    this.scheduledTasks.set('rss_collection', intervalId);
    
    // Run initial collection immediately
    await this.scheduleRSSCollection();
    
    logger.logAgentAction('orchestrator', 'scheduling_active', {
      intervalMs: config.scheduling.rssCollectionIntervalMs
    }, correlationId);
  }

  async scheduleRSSCollection(): Promise<void> {
    const correlationId = logger.generateCorrelationId();
    
    try {
      logger.logAgentAction('orchestrator', 'task_scheduled', {
        task: 'rss_collection',
        sources: Object.keys(config.rssSources)
      }, correlationId);

      // Send task to RSS collector
      await messageQueue.publish('rss_tasks', {
        type: 'collect_feeds',
        sources: config.rssSources,
        correlationId,
        scheduledBy: 'orchestrator',
        scheduledAt: new Date().toISOString()
      });

      logger.logAgentHandoff('orchestrator', 'rss-collector', {
        task: 'collect_feeds',
        sourceCount: Object.keys(config.rssSources).length
      }, correlationId);

    } catch (error) {
      logger.logError('orchestrator', error as Error, correlationId);
    }
  }

  async processResults(channel: string = 'orchestrator_results'): Promise<void> {
    await messageQueue.subscribe(channel, (message) => {
      this.handleAgentResult(message as AgentResult);
    });
  }

  async handleAgentResult(message: any): Promise<void> {
    const { fromAgent, result, correlationId } = message as AgentResult;
    
    logger.logAgentAction('orchestrator', 'result_received', {
      fromAgent,
      resultType: result.type,
      itemCount: result.items ? result.items.length : 0
    }, correlationId);

    if (result.type === 'rss_data_collected') {
      // Forward to analysis agent
      await messageQueue.publish('analysis_tasks', {
        type: 'analyze_rss_data',
        data: result.data,
        correlationId,
        forwardedBy: 'orchestrator',
        originalSource: fromAgent
      });

      logger.logAgentHandoff('orchestrator', 'analysis-agent', {
        task: 'analyze_rss_data',
        dataSize: result.data ? result.data.length : 0
      }, correlationId);
    }

    if (result.type === 'analysis_complete') {
      this.cycleCount++;
      logger.logAgentAction('orchestrator', 'cycle_complete', {
        totalCycles: this.getCycleCount(),
        analysisResults: result.summary
      }, correlationId);
    }
  }

  getCycleCount(): number {
    return this.cycleCount;
  }

  async stopScheduling(): Promise<void> {
    this.isRunning = false;
    
    // Clear all scheduled tasks
    for (const [taskName, intervalId] of this.scheduledTasks) {
      clearInterval(intervalId);
      logger.logAgentAction('orchestrator', 'task_stopped', { taskName });
    }
    
    this.scheduledTasks.clear();
    logger.logAgentAction('orchestrator', 'scheduling_stopped');
  }

  async getStatus(): Promise<OrchestratorStatus> {
    return {
      isRunning: this.isRunning,
      activeTasks: Array.from(this.scheduledTasks.keys()),
      cycleCount: this.getCycleCount()
    };
  }
}

export default OrchestratorAgent;