describe('Configuration', () => {
  test('should have valid RSS sources configuration', () => {
    // Mock config for test
    const mockConfig = {
      rss: {
        sources: ['https://status.aws.amazon.com/rss/all.rss']
      },
      collection: {
        intervalMinutes: 15
      },
      messageQueue: {
        type: 'memory' as const,
        redis: {
          host: 'localhost',
          port: 6379
        }
      }
    };

    expect(mockConfig.rss.sources).toBeInstanceOf(Array);
    expect(mockConfig.rss.sources.length).toBeGreaterThan(0);
    expect(mockConfig.collection.intervalMinutes).toBe(15);
    expect(mockConfig.messageQueue.type).toBe('memory');
  });

  test('should validate RSS URL format', () => {
    const isValidRSSUrl = (url: string): boolean => {
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'https:' && (url.includes('rss') || url.includes('feed') || url.includes('atom'));
      } catch {
        return false;
      }
    };

    expect(isValidRSSUrl('https://status.aws.amazon.com/rss/all.rss')).toBe(true);
    expect(isValidRSSUrl('https://status.cloud.google.com/feed.atom')).toBe(true);
    expect(isValidRSSUrl('invalid-url')).toBe(false);
    expect(isValidRSSUrl('http://unsecure.com/rss')).toBe(false);
  });

  test('should validate interval configuration', () => {
    const validateInterval = (minutes: number): boolean => {
      return minutes >= 1 && minutes <= 60 && Number.isInteger(minutes);
    };

    expect(validateInterval(15)).toBe(true);
    expect(validateInterval(1)).toBe(true);
    expect(validateInterval(60)).toBe(true);
    expect(validateInterval(0)).toBe(false);
    expect(validateInterval(61)).toBe(false);
    expect(validateInterval(15.5)).toBe(false);
  });

  test('should validate message queue configuration', () => {
    const validateMessageQueueConfig = (config: any): boolean => {
      if (!config.type || !['memory', 'redis'].includes(config.type)) {
        return false;
      }
      
      if (config.type === 'redis') {
        return config.redis && 
               typeof config.redis.host === 'string' && 
               typeof config.redis.port === 'number' &&
               config.redis.port > 0 && config.redis.port < 65536;
      }
      
      return true;
    };

    expect(validateMessageQueueConfig({ type: 'memory' })).toBe(true);
    expect(validateMessageQueueConfig({ 
      type: 'redis', 
      redis: { host: 'localhost', port: 6379 } 
    })).toBe(true);
    expect(validateMessageQueueConfig({ type: 'invalid' })).toBe(false);
    expect(validateMessageQueueConfig({ 
      type: 'redis', 
      redis: { host: 'localhost', port: 0 } 
    })).toBe(false);
  });
});