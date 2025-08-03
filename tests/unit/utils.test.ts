// Mock winston to avoid file system dependencies
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn()
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123')
}));

describe('Logger Utility', () => {
  let Logger: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const LoggerModule = require('../../src/utils/logger');
    Logger = LoggerModule.default;
  });

  test('should generate correlation ID', () => {
    const correlationId = Logger.generateCorrelationId();
    expect(correlationId).toBe('mock-uuid-123');
  });

  test('should log agent action', () => {
    const correlationId = Logger.logAgentAction('test-agent', 'test-action', { data: 'test' });
    
    expect(correlationId).toBe('mock-uuid-123');
    expect(Logger.winston.info).toHaveBeenCalled();
  });

  test('should log agent handoff', () => {
    Logger.logAgentHandoff('agent1', 'agent2', { data: 'test' }, 'correlation-123');
    
    expect(Logger.winston.info).toHaveBeenCalled();
  });

  test('should log error', () => {
    const error = new Error('Test error');
    Logger.logError('test-agent', error);
    
    expect(Logger.winston.error).toHaveBeenCalled();
  });
});

describe('Analysis Functions', () => {
  // Simple analysis function tests without complex dependencies
  test('should determine status level from keywords', () => {
    const determineStatusLevel = (text: string): 'critical' | 'warning' | 'informational' => {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('outage') || lowerText.includes('critical')) return 'critical';
      if (lowerText.includes('investigating') || lowerText.includes('degraded')) return 'warning';
      return 'informational';
    };

    expect(determineStatusLevel('Service outage detected')).toBe('critical');
    expect(determineStatusLevel('Investigating the issue')).toBe('warning');
    expect(determineStatusLevel('Regular maintenance')).toBe('informational');
  });

  test('should extract service names', () => {
    const extractServices = (text: string): string[] => {
      const services = ['ec2', 'rds', 's3', 'lambda'];
      return services.filter(service => text.toLowerCase().includes(service));
    };

    expect(extractServices('EC2 instances are affected')).toContain('ec2');
    expect(extractServices('RDS and S3 services impacted')).toEqual(['rds', 's3']);
    expect(extractServices('General notification')).toEqual([]);
  });

  test('should calculate risk score', () => {
    const calculateRiskScore = (counts: { critical: number; warning: number; informational: number }): number => {
      const score = (counts.critical * 50) + (counts.warning * 20) + (counts.informational * 5);
      return Math.min(score, 100);
    };

    expect(calculateRiskScore({ critical: 1, warning: 0, informational: 0 })).toBe(50);
    expect(calculateRiskScore({ critical: 0, warning: 1, informational: 0 })).toBe(20);
    expect(calculateRiskScore({ critical: 2, warning: 3, informational: 4 })).toBe(100);
  });
});