import { AppConfig } from './types';

export const baseConfig: AppConfig = {
  rss: {
    sources: {
      aws: 'https://status.aws.amazon.com/rss/all.rss'
    },
    timeout: 30000, // 30 seconds
    userAgent: 'Varuna-Monitor/1.0.0'
  },

  scheduling: {
    rssCollectionIntervalMs: 15 * 60 * 1000, // 15 minutes
    maxRetries: 3,
    retryDelayMs: 5000, // 5 seconds
    batchSize: 10
  },

  messageQueue: {
    type: 'memory',
    redis: {
      host: 'localhost',
      port: 6379
    }
  },

  logging: {
    level: 'info',
    format: 'json'
  },

  monitoring: {
    enabled: false,
    port: 3001,
    metricsPath: '/metrics'
  }
};