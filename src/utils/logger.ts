import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

interface LogData {
  [key: string]: any;
}

interface AgentLogData extends LogData {
  agentId: string;
  action: string;
  correlationId: string;
  timestamp: string;
}

interface HandoffLogData {
  fromAgent: string;
  toAgent: string;
  correlationId: string;
  data: any;
  timestamp: string;
}

interface ErrorLogData {
  agentId: string;
  error: string;
  stack?: string;
  correlationId: string | null;
  timestamp: string;
}

class Logger {
  private winston: winston.Logger;

  constructor() {
    this.winston = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ filename: 'logs/agents.log' })
      ]
    });
  }

  generateCorrelationId(): string {
    return uuidv4();
  }

  logAgentAction(
    agentId: string, 
    action: string, 
    data: LogData = {}, 
    correlationId: string | null = null
  ): string {
    const logData: AgentLogData = {
      agentId,
      action,
      correlationId: correlationId || this.generateCorrelationId(),
      timestamp: new Date().toISOString(),
      ...data
    };

    this.winston.info('Agent Action', logData);
    return logData.correlationId;
  }

  logAgentHandoff(
    fromAgent: string, 
    toAgent: string, 
    data: any, 
    correlationId: string
  ): void {
    const logData: HandoffLogData = {
      fromAgent,
      toAgent,
      correlationId,
      data,
      timestamp: new Date().toISOString()
    };

    this.winston.info('Agent Handoff', logData);
  }

  logError(
    agentId: string, 
    error: Error, 
    correlationId: string | null = null
  ): void {
    const logData: ErrorLogData = {
      agentId,
      error: error.message,
      stack: error.stack,
      correlationId,
      timestamp: new Date().toISOString()
    };

    this.winston.error('Agent Error', logData);
  }
}

export default new Logger();