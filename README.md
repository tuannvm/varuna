# Varuna - Proactive Cloud Monitoring System

A multi-agent system built with TypeScript and OpenAI Agents SDK to research correlation between external cloud provider signals and internal infrastructure incidents.

## Phase 0: Multi-Agent RSS Monitoring MVP

**Status**: ✅ Implemented and Tested
**Goal**: Demonstrate reliable 3-agent coordination with RSS feed processing

### Architecture

```
Orchestrator Agent ──┐
                     ├── Message Queue ──► RSS Collector Agent
                     │                           │
                     └── Analysis Agent ◄────────┘
```

### Agents

- **Orchestrator**: Schedules RSS collection every 15 minutes, coordinates agent handoffs
- **RSS Collector**: Fetches and parses AWS/GCP status feeds  
- **Analysis Agent**: Extracts service names, status levels, and calculates risk scores

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Development mode (TypeScript)
npm run dev:status    # Check system status
npm run dev:start     # Start monitoring system

# Production mode (compiled JavaScript)
npm run status        # Check system status  
npm start            # Start Phase 0 monitoring (48 cycles / 12 hours)

# Test TypeScript implementation
npm test             # Run quick coordination test
```

## Success Criteria (Phase 0)

- ✅ 3-agent system coordination with message passing
- ✅ RSS feed collection from AWS/GCP every 15 minutes
- ✅ Structured logging with correlation IDs for all agent handoffs
- ✅ Analysis agent extracts status levels and risk scores
- 🎯 Target: 48 continuous data cycles without failure

## Logs & Monitoring

All agent actions logged to:
- Console: Real-time colored output
- File: `logs/agents.log` (structured JSON)

Each operation tracked with correlation IDs for full traceability.

## Configuration

Edit `src/config/index.js`:
- RSS feed URLs
- Collection intervals  
- Message queue settings
- Logging configuration

## Next Phases

- **Phase 1** (Week 7-12): Add internal metrics agent + Slack notifications
- **Phase 2** (Week 13-18): Auto-discovery agent for new data sources  
- **Phase 3** (Week 19-24): Production hardening and reliability

## Development

```bash
# Project structure
src/
├── agents/           # TypeScript agent implementations
│   ├── orchestrator.ts
│   ├── rssCollector.ts
│   └── analysisAgent.ts
├── config/           # Configuration
│   └── index.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Logging, message queue utilities
│   ├── logger.ts
│   └── messageQueue.ts
└── index.ts          # Main system entry point

docs/                 # Implementation plans
test-phase0.ts        # TypeScript coordination test suite
tsconfig.json         # TypeScript configuration
dist/                 # Compiled JavaScript output
```