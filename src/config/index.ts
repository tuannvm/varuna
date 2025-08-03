import { Config } from '../types';

const config: Config = {
  // RSS feed URLs for cloud providers
  rssSources: {
    aws: 'https://status.aws.amazon.com/rss/all.rss',
    azure: 'https://azure.status.microsoft.com/en-us/status/feed/'
  },
  
  // Agent scheduling configuration
  scheduling: {
    rssCollectionIntervalMs: 15 * 60 * 1000, // 15 minutes
    maxRetries: 3,
    retryDelayMs: 5000
  },

  // Message queue configuration
  messageQueue: {
    type: 'memory', // 'redis' or 'memory'
    redis: {
      host: 'localhost',
      port: 6379
    }
  },

  // Logging configuration
  logging: {
    level: 'info',
    format: 'json'
  }
};

export default config;