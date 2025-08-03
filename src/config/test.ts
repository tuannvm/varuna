import { AppConfig } from './types';
import { baseConfig } from './base';

export const testConfig: Partial<AppConfig> = {
  rss: {
    ...baseConfig.rss,
    sources: {
      test: 'https://httpbin.org/xml' // Mock RSS endpoint for testing
    },
    timeout: 5000 // Short timeout for tests
  },

  scheduling: {
    ...baseConfig.scheduling,
    rssCollectionIntervalMs: 1000, // 1 second for fast tests
    maxRetries: 1,
    retryDelayMs: 100,
    batchSize: 5
  },

  messageQueue: {
    ...baseConfig.messageQueue,
    type: 'memory' // Always use memory for tests
  },

  logging: {
    ...baseConfig.logging,
    level: 'error', // Minimal logging in tests
    format: 'simple'
  },

  monitoring: {
    ...baseConfig.monitoring,
    enabled: false // Disable monitoring in tests
  }
};