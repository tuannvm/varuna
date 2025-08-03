# Varuna Examples

This directory contains practical examples demonstrating how to use the Varuna cloud monitoring system.

## Available Examples

### 1. Basic Usage (`basic-usage.ts`)
Learn the fundamentals of using Varuna:
- System initialization
- Starting and stopping monitoring
- Checking system status
- Basic lifecycle management

```bash
# Run the basic usage example
npm run example:basic

# Or directly with ts-node
npx ts-node examples/basic-usage.ts
```

### 2. Custom Configuration (`custom-config.ts`)
Understand configuration management:
- Environment-specific configurations
- Custom RSS sources
- Configuration validation
- Production vs development settings

```bash
# Run the configuration example
npm run example:config

# Or directly with ts-node
npx ts-node examples/custom-config.ts
```

## Running Examples

### Prerequisites
Make sure you have the development environment set up:
```bash
npm install
npm run build
```

### Method 1: NPM Scripts
Add these scripts to your `package.json`:
```json
{
  "scripts": {
    "example:basic": "ts-node examples/basic-usage.ts",
    "example:config": "ts-node examples/custom-config.ts"
  }
}
```

### Method 2: Direct Execution
```bash
# Make examples executable
chmod +x examples/*.ts

# Run directly
npx ts-node examples/basic-usage.ts
npx ts-node examples/custom-config.ts
```

## Example Scenarios

### Development Environment
```bash
NODE_ENV=development npx ts-node examples/basic-usage.ts
```

### Production Simulation
```bash
NODE_ENV=production npx ts-node examples/basic-usage.ts
```

### Test Environment
```bash
NODE_ENV=test npx ts-node examples/basic-usage.ts
```

## Creating Your Own Examples

1. Create a new TypeScript file in the `examples/` directory
2. Import the necessary modules from `../src/`
3. Follow the pattern of existing examples:
   ```typescript
   #!/usr/bin/env ts-node
   
   import Phase0System from '../src/index';
   
   async function myExample(): Promise<void> {
     // Your example code here
   }
   
   if (require.main === module) {
     myExample().catch(console.error);
   }
   ```

## Common Patterns

### Error Handling
```typescript
try {
  await system.initialize();
  // ... your code
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
```

### Graceful Shutdown
```typescript
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await system.stop();
  process.exit(0);
});
```

### Status Monitoring
```typescript
const status = await system.getSystemStatus();
console.log(`Running: ${status.system.isRunning}`);
console.log(`Uptime: ${status.system.uptime}ms`);
console.log(`Cycles: ${status.system.cycleCount}`);
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure you've built the project first with `npm run build`
2. **Permission Issues**: Ensure scripts are executable with `chmod +x examples/*.ts`
3. **Module Not Found**: Install dependencies with `npm install`
4. **TypeScript Errors**: Check that you have `ts-node` installed globally or use `npx`

### Getting Help

- Check the main [README.md](../README.md) for project overview
- Review the [docs/](../docs/) directory for detailed documentation
- Run tests to ensure your environment is working: `npm test`

## Contributing Examples

We welcome contributions of new examples! Please:

1. Follow the existing code style and patterns
2. Include comprehensive comments explaining the concepts
3. Add error handling and graceful shutdown
4. Update this README with your new example
5. Test your example in different environments

Examples should be:
- **Educational**: Teach specific concepts or patterns
- **Practical**: Show real-world usage scenarios
- **Well-documented**: Include clear comments and explanations
- **Standalone**: Work independently without external dependencies