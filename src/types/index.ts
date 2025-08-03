export interface RSSSource {
  provider: string;
  url: string;
  items?: RSSItem[];
  error?: string;
  fetchedAt: string;
  itemCount: number;
}

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  guid: string;
  categories: string[];
}

export interface AnalyzedItem {
  id: string;
  title: string;
  statusLevel: 'critical' | 'warning' | 'informational';
  services: string[];
  timestamp: string;
  link: string;
  extractedInfo: {
    hasServiceNames: boolean;
    wordCount: number;
    matchedKeywords: string[];
  };
}

export interface AnalysisResult {
  provider: string;
  status: 'success' | 'error' | 'analysis_error';
  summary?: AnalysisSummary;
  items?: AnalyzedItem[];
  error?: string;
  analyzedAt: string;
}

export interface AnalysisSummary {
  provider: string;
  totalItems: number;
  criticalCount: number;
  warningCount: number;
  informationalCount: number;
  uniqueServices: string[];
  riskScore: number;
  lastUpdate: string | null;
}

export interface OverallSummary {
  totalProviders: number;
  totalCritical: number;
  totalWarning: number;
  totalInformational: number;
  allServices: string[];
  overallRiskScore: number;
}

export interface AgentMessage {
  type: string;
  correlationId: string;
  timestamp?: string;
  fromAgent?: string;
  result?: any;
  completedAt?: string;
  [key: string]: any;
}

export interface CollectionTask extends AgentMessage {
  type: 'collect_rss';
  sources: string[];
}

export interface OrchestratorStatus {
  name: string;
  isRunning: boolean;
  scheduledSources: string[];
  intervalMinutes: number;
  lastCollectionTime: string | null;
  totalCollections: number;
}

export interface AgentResult extends AgentMessage {
  fromAgent: string;
  result: {
    type: string;
    data?: any;
    summary?: any;
    [key: string]: any;
  };
  completedAt: string;
}

export interface SystemStatus {
  system: {
    isRunning: boolean;
    startTime: Date | null;
    cycleCount: number;
    uptime: number;
  };
  agents: {
    orchestrator: {
      isRunning: boolean;
      activeTasks: string[];
      cycleCount: number;
    };
    collector: {
      name: string;
      status: string;
      supportedSources: string[];
    };
    analysis: {
      name: string;
      status: string;
      supportedAnalysis: string[];
      keywordCategories: string[];
    };
  };
}

export interface Config {
  rssSources: Record<string, string>;
  scheduling: {
    rssCollectionIntervalMs: number;
    maxRetries: number;
    retryDelayMs: number;
  };
  messageQueue: {
    type: 'memory' | 'redis';
    redis: {
      host: string;
      port: number;
    };
  };
  logging: {
    level: string;
    format: string;
  };
}