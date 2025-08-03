import { AppConfig } from './types';
import { baseConfig } from './base';
import { developmentConfig } from './development';
import { productionConfig } from './production';
import { testConfig } from './test';

function getEnvironment(): 'development' | 'production' | 'test' {
  return (process.env.NODE_ENV as any) || 'development';
}

function mergeConfigs(base: AppConfig, override: Partial<AppConfig>): AppConfig {
  return {
    rss: { ...base.rss, ...override.rss },
    scheduling: { ...base.scheduling, ...override.scheduling },
    messageQueue: { 
      ...base.messageQueue, 
      ...override.messageQueue,
      redis: { ...base.messageQueue.redis, ...override.messageQueue?.redis }
    },
    logging: { ...base.logging, ...override.logging },
    monitoring: { ...base.monitoring, ...override.monitoring }
  };
}

function createConfig(): AppConfig {
  const env = getEnvironment();
  
  switch (env) {
    case 'production':
      return mergeConfigs(baseConfig, productionConfig);
    case 'test':
      return mergeConfigs(baseConfig, testConfig);
    case 'development':
    default:
      return mergeConfigs(baseConfig, developmentConfig);
  }
}

const config = createConfig();

// Legacy exports for backward compatibility
export default {
  rssSources: config.rss.sources,
  rss: config.rss,
  collection: {
    intervalMinutes: config.scheduling.rssCollectionIntervalMs / (1000 * 60)
  },
  scheduling: config.scheduling,
  messageQueue: config.messageQueue,
  logging: config.logging,
  monitoring: config.monitoring
};

// New structured export
export { config as appConfig };
export * from './types';