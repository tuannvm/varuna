import { Agent } from '@openai/agents';
import logger from '../utils/logger';
import messageQueue from '../utils/messageQueue';
import { 
  RSSSource, 
  AnalyzedItem, 
  AnalysisResult, 
  AnalysisSummary, 
  OverallSummary,
  AgentMessage 
} from '../types';

interface AnalysisTask extends AgentMessage {
  type: 'analyze_rss_data';
  data: RSSSource[];
}

interface StatusKeywords {
  critical: string[];
  warning: string[];
  informational: string[];
}

interface AnalysisStatus {
  name: string;
  status: string;
  supportedAnalysis: string[];
  keywordCategories: string[];
}

class AnalysisAgent extends Agent {
  private statusKeywords: StatusKeywords;

  constructor() {
    super({
      name: 'analysis-agent'
    });
    
    this.statusKeywords = {
      critical: ['outage', 'down', 'unavailable', 'failed', 'critical'],
      warning: ['investigating', 'degraded', 'issues', 'problems', 'delayed'],
      informational: ['resolved', 'completed', 'update', 'maintenance', 'scheduled']
    };
  }

  async initialize(): Promise<void> {
    await messageQueue.subscribe('analysis_tasks', (message) => {
      this.handleTask(message as AnalysisTask);
    });
    
    logger.logAgentAction('analysis-agent', 'initialized');
  }

  async handleTask(task: AnalysisTask): Promise<void> {
    const { type, data, correlationId } = task;
    
    if (type === 'analyze_rss_data') {
      logger.logAgentAction('analysis-agent', 'task_received', {
        dataSourceCount: data.length
      }, correlationId);
      
      await this.analyzeRSSData(data, correlationId);
    }
  }

  async analyzeRSSData(rssData: RSSSource[], correlationId: string): Promise<void> {
    const analysisResults: AnalysisResult[] = [];
    
    for (const source of rssData) {
      try {
        logger.logAgentAction('analysis-agent', 'analyzing_source', {
          provider: source.provider,
          itemCount: source.itemCount
        }, correlationId);
        
        if (source.error) {
          analysisResults.push({
            provider: source.provider,
            status: 'error',
            error: source.error,
            analyzedAt: new Date().toISOString()
          });
          continue;
        }
        
        const analyzedItems = (source.items || []).map(item => this.analyzeItem(item));
        const summary = this.generateSummary(source.provider, analyzedItems);
        
        analysisResults.push({
          provider: source.provider,
          status: 'success',
          summary,
          items: analyzedItems,
          analyzedAt: new Date().toISOString()
        });
        
        logger.logAgentAction('analysis-agent', 'analysis_complete', {
          provider: source.provider,
          criticalItems: summary.criticalCount,
          warningItems: summary.warningCount
        }, correlationId);
        
      } catch (error) {
        logger.logError('analysis-agent', error as Error, correlationId);
        
        analysisResults.push({
          provider: source.provider,
          status: 'analysis_error',
          error: (error as Error).message,
          analyzedAt: new Date().toISOString()
        });
      }
    }

    // Send results back to orchestrator
    await messageQueue.publish('orchestrator_results', {
      type: 'result',
      fromAgent: 'analysis-agent',
      result: {
        type: 'analysis_complete',
        data: analysisResults,
        summary: this.generateOverallSummary(analysisResults)
      },
      correlationId,
      completedAt: new Date().toISOString()
    });

    const overallSummary = this.generateOverallSummary(analysisResults);
    logger.logAgentAction('analysis-agent', 'analysis_batch_complete', {
      providersAnalyzed: analysisResults.length,
      totalCritical: overallSummary.totalCritical,
      totalWarning: overallSummary.totalWarning
    }, correlationId);
  }

  private analyzeItem(item: any): AnalyzedItem {
    const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
    const statusLevel = this.determineStatusLevel(text);
    const services = this.extractServices(text);
    const timestamp = new Date(item.pubDate || Date.now());
    
    return {
      id: item.guid || '',
      title: item.title || '',
      statusLevel,
      services,
      timestamp: timestamp.toISOString(),
      link: item.link || '',
      extractedInfo: {
        hasServiceNames: services.length > 0,
        wordCount: text.split(' ').length,
        matchedKeywords: this.getMatchedKeywords(text, statusLevel)
      }
    };
  }

  private determineStatusLevel(text: string): 'critical' | 'warning' | 'informational' {
    for (const [level, keywords] of Object.entries(this.statusKeywords)) {
      if (keywords.some((keyword: string) => text.includes(keyword))) {
        return level as 'critical' | 'warning' | 'informational';
      }
    }
    return 'informational';
  }

  private extractServices(text: string): string[] {
    // Basic service extraction - could be enhanced with more sophisticated NLP
    const commonServices = [
      'ec2', 'rds', 's3', 'lambda', 'cloudfront', 'route53', 'elb',
      'compute engine', 'cloud storage', 'kubernetes', 'app engine',
      'cloud sql', 'cloud cdn', 'cloud dns'
    ];
    
    return commonServices.filter(service => text.includes(service));
  }

  private getMatchedKeywords(text: string, statusLevel: 'critical' | 'warning' | 'informational'): string[] {
    const keywords = this.statusKeywords[statusLevel];
    if (!keywords) return [];
    return keywords.filter((keyword: string) => text.includes(keyword));
  }

  private generateSummary(provider: string, analyzedItems: AnalyzedItem[]): AnalysisSummary {
    const counts = {
      critical: 0,
      warning: 0,
      informational: 0
    };
    
    const services = new Set<string>();
    
    analyzedItems.forEach(item => {
      counts[item.statusLevel]++;
      item.services.forEach(service => services.add(service));
    });
    
    return {
      provider,
      totalItems: analyzedItems.length,
      criticalCount: counts.critical,
      warningCount: counts.warning,
      informationalCount: counts.informational,
      uniqueServices: Array.from(services),
      riskScore: this.calculateRiskScore(counts),
      lastUpdate: analyzedItems.length > 0 ? analyzedItems[0].timestamp : null
    };
  }

  private generateOverallSummary(analysisResults: AnalysisResult[]): OverallSummary {
    const totals: OverallSummary = {
      totalProviders: analysisResults.length,
      totalCritical: 0,
      totalWarning: 0,
      totalInformational: 0,
      allServices: [],
      overallRiskScore: 0
    };

    const allServices = new Set<string>();
    let totalRiskScore = 0;

    analysisResults.forEach(result => {
      if (result.status === 'success' && result.summary) {
        totals.totalCritical += result.summary.criticalCount;
        totals.totalWarning += result.summary.warningCount;
        totals.totalInformational += result.summary.informationalCount;
        result.summary.uniqueServices.forEach(service => allServices.add(service));
        totalRiskScore += result.summary.riskScore;
      }
    });

    totals.overallRiskScore = Math.round(totalRiskScore / totals.totalProviders);
    totals.allServices = Array.from(allServices);

    return totals;
  }

  private calculateRiskScore(counts: { critical: number; warning: number; informational: number }): number {
    // Simple risk scoring: critical=50 points, warning=20 points, informational=5 points
    const score = (counts.critical * 50) + (counts.warning * 20) + (counts.informational * 5);
    return Math.min(score, 100); // Cap at 100
  }

  async getStatus(): Promise<AnalysisStatus> {
    return {
      name: 'analysis-agent',
      status: 'active',
      supportedAnalysis: ['status_level', 'service_extraction', 'risk_scoring'],
      keywordCategories: Object.keys(this.statusKeywords)
    };
  }
}

export default AnalysisAgent;
