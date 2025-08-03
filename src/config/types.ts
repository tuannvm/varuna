export interface DatabaseConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  database?: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface RSSConfig {
  sources: Record<string, string>;
  timeout: number;
  userAgent: string;
}

export interface SchedulingConfig {
  rssCollectionIntervalMs: number;
  maxRetries: number;
  retryDelayMs: number;
  batchSize: number;
}

export interface MessageQueueConfig {
  type: 'memory' | 'redis';
  redis: RedisConfig;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'simple';
  filePath?: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  port: number;
  metricsPath: string;
}

export interface AppConfig {
  rss: RSSConfig;
  scheduling: SchedulingConfig;
  messageQueue: MessageQueueConfig;
  logging: LoggingConfig;
  monitoring: MonitoringConfig;
}

export interface EnvironmentConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  logLevel: string;
}