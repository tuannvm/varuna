import { AppConfig } from './types';
import { baseConfig } from './base';

export const developmentConfig: Partial<AppConfig> = {
  logging: {
    ...baseConfig.logging,
    level: 'debug',
    format: 'simple'
  },

  scheduling: {
    ...baseConfig.scheduling,
    rssCollectionIntervalMs: 5 * 60 * 1000, // 5 minutes for faster testing
    retryDelayMs: 2000 // Faster retries in development
  },

  monitoring: {
    ...baseConfig.monitoring,
    enabled: true
  }
};