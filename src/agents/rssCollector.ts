import { Agent } from '@openai/agents';
import FeedParser = require('feedparser');
import * as https from 'https';
import * as http from 'http';
import logger from '../utils/logger';
import messageQueue from '../utils/messageQueue';
import config from '../config';
import { RSSSource, RSSItem, AgentMessage } from '../types';

interface CollectionTask extends AgentMessage {
  type: 'collect_feeds';
  sources: Record<string, string>;
}

interface CollectorStatus {
  name: string;
  status: string;
  supportedSources: string[];
}

class RSSCollectorAgent extends Agent {
  constructor() {
    super({
      name: 'rss-collector'
    });
  }

  async initialize(): Promise<void> {
    await messageQueue.subscribe('rss_tasks', (message) => {
      this.handleTask(message as CollectionTask);
    });
    
    logger.logAgentAction('rss-collector', 'initialized');
  }

  async handleTask(task: CollectionTask): Promise<void> {
    const { type, sources, correlationId } = task;
    
    if (type === 'collect_feeds') {
      logger.logAgentAction('rss-collector', 'task_received', {
        sourceCount: Object.keys(sources).length
      }, correlationId);
      
      await this.collectFeeds(sources, correlationId);
    }
  }

  async collectFeeds(sources: Record<string, string>, correlationId: string): Promise<void> {
    const results: RSSSource[] = [];
    
    for (const [provider, url] of Object.entries(sources)) {
      let attempts = 0;
      let success = false;
      
      while (attempts < config.scheduling.maxRetries && !success) {
        try {
          attempts++;
          logger.logAgentAction('rss-collector', 'fetching_feed', {
            provider,
            url,
            attempt: attempts
          }, correlationId);
          
          const feedData = await this.fetchFeed(url);
          const parsedItems = await this.parseFeed(feedData);
          
          results.push({
            provider,
            url,
            items: parsedItems,
            fetchedAt: new Date().toISOString(),
            itemCount: parsedItems.length
          });
          
          logger.logAgentAction('rss-collector', 'feed_processed', {
            provider,
            itemCount: parsedItems.length,
            attempts
          }, correlationId);
          
          success = true;
          
        } catch (error) {
          logger.logError('rss-collector', error as Error, correlationId);
          
          if (attempts >= config.scheduling.maxRetries) {
            results.push({
              provider,
              url,
              error: `Failed after ${attempts} attempts: ${(error as Error).message}`,
              fetchedAt: new Date().toISOString(),
              itemCount: 0
            });
          } else {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, config.scheduling.retryDelayMs));
          }
        }
      }
    }

    // Send results back to orchestrator
    await messageQueue.publish('orchestrator_results', {
      type: 'result',
      fromAgent: 'rss-collector',
      result: {
        type: 'rss_data_collected',
        data: results,
        totalItems: results.reduce((sum, r) => sum + (r.itemCount || 0), 0)
      },
      correlationId,
      completedAt: new Date().toISOString()
    });

    logger.logAgentAction('rss-collector', 'collection_complete', {
      providersProcessed: results.length,
      totalItems: results.reduce((sum, r) => sum + (r.itemCount || 0), 0)
    }, correlationId);
  }

  private async fetchFeed(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const req = client.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  private async parseFeed(feedData: string): Promise<RSSItem[]> {
    return new Promise((resolve, reject) => {
      const items: RSSItem[] = [];
      const feedparser = new FeedParser({});
      
      feedparser.on('error', reject);
      feedparser.on('readable', function(this: any) {
        let item: any;
        while (item = this.read()) {
          items.push({
            title: item.title || '',
            description: item.description || '',
            link: item.link || '',
            pubDate: item.pubdate || new Date(),
            guid: item.guid || '',
            categories: item.categories || []
          });
        }
      });
      
      feedparser.on('end', () => resolve(items));
      feedparser.write(feedData);
      feedparser.end();
    });
  }

  async getStatus(): Promise<CollectorStatus> {
    return {
      name: 'rss-collector',
      status: 'active',
      supportedSources: Object.keys(config.rssSources)
    };
  }
}

export default RSSCollectorAgent;