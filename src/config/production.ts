import { AppConfig } from './types';
import { baseConfig } from './base';

export const productionConfig: Partial<AppConfig> = {
  rss: {
    ...baseConfig.rss,
    sources: {
      aws: 'https://status.aws.amazon.com/rss/all.rss',
      gcp: 'https://status.cloud.google.com/feed.atom',
      azure: 'https://azure.status.microsoft/en-us/status/feed'
    },
    timeout: 60000 // Longer timeout for production
  },

  scheduling: {
    ...baseConfig.scheduling,
    rssCollectionIntervalMs: 15 * 60 * 1000, // 15 minutes
    maxRetries: 5, // More retries in production
    retryDelayMs: 10000, // Longer delays in production
    batchSize: 20
  },

  messageQueue: {
    ...baseConfig.messageQueue,
    type: process.env.REDIS_URL ? 'redis' : 'memory',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    }
  },

  logging: {
    ...baseConfig.logging,
    level: 'info',
    format: 'json',
    filePath: '/var/log/varuna/app.log'
  },

  monitoring: {
    ...baseConfig.monitoring,
    enabled: true,
    port: parseInt(process.env.METRICS_PORT || '3001')
  }
};