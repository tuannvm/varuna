#!/usr/bin/env ts-node

/**
 * Custom Configuration Example
 * 
 * This example shows how to work with different configurations
 * and environment-specific settings.
 */

import { appConfig } from '../src/config';
import { AppConfig } from '../src/config/types';

function demonstrateConfiguration(): void {
  console.log('⚙️  Varuna Configuration Example\n');

  // Display current configuration
  console.log('📋 Current Configuration:');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`RSS Sources: ${Object.keys(appConfig.rss.sources).join(', ')}`);
  console.log(`Collection Interval: ${appConfig.scheduling.rssCollectionIntervalMs / 1000}s`);
  console.log(`Message Queue Type: ${appConfig.messageQueue.type}`);
  console.log(`Logging Level: ${appConfig.logging.level}`);
  console.log(`Monitoring Enabled: ${appConfig.monitoring.enabled}\n`);

  // Show how to create custom configuration
  console.log('🔧 Creating Custom Configuration:');
  
  const customConfig: Partial<AppConfig> = {
    rss: {
      sources: {
        aws: 'https://status.aws.amazon.com/rss/all.rss',
        gcp: 'https://status.cloud.google.com/feed.atom',
        custom: 'https://example.com/custom-feed.rss'
      },
      timeout: 45000,
      userAgent: 'MyCustomMonitor/2.0.0'
    },
    scheduling: {
      rssCollectionIntervalMs: 10 * 60 * 1000, // 10 minutes
      maxRetries: 5,
      retryDelayMs: 8000,
      batchSize: 15
    },
    logging: {
      level: 'debug',
      format: 'json',
      filePath: './logs/custom-varuna.log'
    }
  };

  console.log('Custom RSS Sources:', Object.keys(customConfig.rss!.sources!));
  console.log('Custom Collection Interval:', customConfig.scheduling!.rssCollectionIntervalMs! / 1000, 'seconds');
  console.log('Custom Logging Level:', customConfig.logging!.level);
  console.log('Custom User Agent:', customConfig.rss!.userAgent);
  console.log();

  // Environment-specific examples
  console.log('🌍 Environment-Specific Configuration Examples:');
  
  console.log('\n📝 Development Environment:');
  console.log('- Debug logging enabled');
  console.log('- Faster collection intervals (5 minutes)');
  console.log('- Monitoring dashboard enabled');
  console.log('- Simple log format for readability');

  console.log('\n🚀 Production Environment:');
  console.log('- Multiple RSS sources (AWS, GCP, Azure)');
  console.log('- Standard intervals (15 minutes)');
  console.log('- Redis message queue');
  console.log('- JSON log format');
  console.log('- File-based logging');

  console.log('\n🧪 Test Environment:');
  console.log('- Mock RSS endpoints');
  console.log('- Fast intervals (1 second)');
  console.log('- Memory-only message queue');
  console.log('- Minimal logging');

  // Configuration validation example
  console.log('\n✅ Configuration Validation:');
  
  const validateConfig = (config: Partial<AppConfig>): string[] => {
    const errors: string[] = [];
    
    if (config.rss?.sources) {
      Object.entries(config.rss.sources).forEach(([name, url]) => {
        try {
          new URL(url);
          if (!url.startsWith('https://')) {
            errors.push(`RSS source '${name}' should use HTTPS`);
          }
        } catch {
          errors.push(`RSS source '${name}' has invalid URL: ${url}`);
        }
      });
    }
    
    if (config.scheduling?.rssCollectionIntervalMs) {
      if (config.scheduling.rssCollectionIntervalMs < 60000) {
        errors.push('Collection interval should be at least 1 minute');
      }
    }
    
    return errors;
  };

  const validationErrors = validateConfig(customConfig);
  if (validationErrors.length === 0) {
    console.log('✅ Custom configuration is valid');
  } else {
    console.log('❌ Configuration validation errors:');
    validationErrors.forEach(error => console.log(`   - ${error}`));
  }

  console.log('\n🎉 Configuration example completed!');
}

// Environment switching example
function demonstrateEnvironmentSwitching(): void {
  console.log('\n🔄 Environment Switching Example:');
  
  const originalEnv = process.env.NODE_ENV;
  
  // Show different environments
  const environments = ['development', 'production', 'test'];
  
  environments.forEach(env => {
    console.log(`\n📊 ${env.toUpperCase()} Configuration:`);
    
    // This would normally require reloading the config module
    // For demonstration purposes, we'll show what would be different
    switch (env) {
      case 'development':
        console.log('  - Fast collection intervals for testing');
        console.log('  - Debug logging enabled');
        console.log('  - Monitoring dashboard available');
        break;
      case 'production':
        console.log('  - Multiple cloud provider sources');
        console.log('  - Redis message queue');
        console.log('  - Structured JSON logging');
        console.log('  - Log file persistence');
        break;
      case 'test':
        console.log('  - Mock RSS endpoints');
        console.log('  - Minimal logging');
        console.log('  - Memory-only queues');
        break;
    }
  });
  
  // Restore original environment
  if (originalEnv) {
    process.env.NODE_ENV = originalEnv;
  }
}

if (require.main === module) {
  demonstrateConfiguration();
  demonstrateEnvironmentSwitching();
}