import redis, { RedisClientType } from 'redis';
import config from '../config';
import { AgentMessage } from '../types';

interface MessageWithTimestamp extends AgentMessage {
  timestamp: string;
}

type MessageCallback = (message: MessageWithTimestamp) => void;

class MessageQueue {
  private type: 'redis' | 'memory';
  private memoryQueue: Map<string, MessageWithTimestamp[]>;
  private redisClient: RedisClientType | null;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private subscribers: Map<string, RedisClientType> = new Map();

  constructor() {
    this.type = config.messageQueue.type;
    this.memoryQueue = new Map();
    this.redisClient = null;
  }

  async initialize(): Promise<void> {
    if (this.type === 'redis') {
      this.redisClient = redis.createClient({
        socket: {
          host: config.messageQueue.redis.host,
          port: config.messageQueue.redis.port
        }
      });
      await this.redisClient.connect();
    }
  }

  async publish(channel: string, message: AgentMessage): Promise<void> {
    const messageData: MessageWithTimestamp = {
      ...message,
      timestamp: new Date().toISOString()
    };

    if (this.type === 'redis' && this.redisClient) {
      await this.redisClient.publish(channel, JSON.stringify(messageData));
    } else {
      // Memory-based queue for simple implementation
      if (!this.memoryQueue.has(channel)) {
        this.memoryQueue.set(channel, []);
      }
      this.memoryQueue.get(channel)!.push(messageData);
    }
  }

  async subscribe(channel: string, callback: MessageCallback): Promise<void> {
    if (this.type === 'redis' && this.redisClient) {
      const subscriber = this.redisClient.duplicate();
      await subscriber.connect();
      this.subscribers.set(channel, subscriber);
      await subscriber.subscribe(channel, (message: string) => {
        callback(JSON.parse(message));
      });
    } else {
      // Memory-based subscription simulation with cleanup
      const intervalId = setInterval(() => {
        if (this.memoryQueue.has(channel)) {
          const messages = this.memoryQueue.get(channel)!;
          while (messages.length > 0) {
            const message = messages.shift();
            if (message) {
              callback(message);
            }
          }
        }
      }, 1000);
      
      this.intervals.set(channel, intervalId);
    }
  }

  async getMessages(channel: string): Promise<MessageWithTimestamp[]> {
    if (this.memoryQueue.has(channel)) {
      const messages = [...this.memoryQueue.get(channel)!];
      this.memoryQueue.set(channel, []);
      return messages;
    }
    return [];
  }

  async close(): Promise<void> {
    // Clear all intervals to prevent memory leaks
    for (const [channel, intervalId] of this.intervals) {
      clearInterval(intervalId);
    }
    this.intervals.clear();
    
    // Close all Redis subscribers
    for (const [channel, subscriber] of this.subscribers) {
      await subscriber.quit();
    }
    this.subscribers.clear();
    
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

export default new MessageQueue();