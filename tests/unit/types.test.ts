import { 
  RSSSource, 
  RSSItem, 
  AnalyzedItem, 
  AnalysisResult, 
  AgentMessage 
} from '../../src/types';

describe('Type Definitions', () => {
  test('should create valid RSSSource object', () => {
    const rssSource: RSSSource = {
      provider: 'AWS',
      url: 'https://status.aws.amazon.com/rss/all.rss',
      fetchedAt: '2025-01-01T12:00:00Z',
      itemCount: 1,
      items: [
        {
          title: 'Test Item',
          description: 'Test description',
          link: 'https://example.com',
          pubDate: new Date('2025-01-01T12:00:00Z'),
          guid: 'test-123',
          categories: ['service']
        }
      ]
    };

    expect(rssSource.provider).toBe('AWS');
    expect(rssSource.itemCount).toBe(1);
    expect(rssSource.items).toHaveLength(1);
  });

  test('should create valid AnalyzedItem object', () => {
    const analyzedItem: AnalyzedItem = {
      id: 'test-123',
      title: 'Test Issue',
      statusLevel: 'critical',
      services: ['ec2'],
      timestamp: '2025-01-01T12:00:00Z',
      link: 'https://example.com',
      extractedInfo: {
        hasServiceNames: true,
        wordCount: 5,
        matchedKeywords: ['critical']
      }
    };

    expect(analyzedItem.statusLevel).toBe('critical');
    expect(analyzedItem.services).toContain('ec2');
    expect(analyzedItem.extractedInfo.hasServiceNames).toBe(true);
  });

  test('should create valid AgentMessage object', () => {
    const message: AgentMessage = {
      type: 'test_message',
      correlationId: 'test-correlation-123'
    };

    expect(message.type).toBe('test_message');
    expect(message.correlationId).toBe('test-correlation-123');
  });

  test('should create valid AnalysisResult object', () => {
    const result: AnalysisResult = {
      provider: 'AWS',
      status: 'success',
      analyzedAt: '2025-01-01T12:00:00Z',
      summary: {
        provider: 'AWS',
        totalItems: 2,
        criticalCount: 1,
        warningCount: 0,
        informationalCount: 1,
        uniqueServices: ['ec2'],
        riskScore: 50,
        lastUpdate: '2025-01-01T12:00:00Z'
      }
    };

    expect(result.status).toBe('success');
    expect(result.summary?.criticalCount).toBe(1);
    expect(result.summary?.riskScore).toBe(50);
  });
});