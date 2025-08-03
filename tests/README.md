# Varuna Test Suite

This directory contains comprehensive tests for the Varuna cloud monitoring system.

## Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── types.test.ts       # Type definition tests
│   ├── utils.test.ts       # Utility function tests
│   └── config.test.ts      # Configuration tests
├── integration/            # Integration tests
│   └── system.integration.test.ts  # Full system tests
└── README.md              # This file
```

## Test Categories

### Unit Tests (`tests/unit/`)
Test individual components in isolation:
- **Type Tests**: Validate TypeScript interfaces and type safety
- **Utility Tests**: Test helper functions and utilities
- **Configuration Tests**: Validate configuration logic

### Integration Tests (`tests/integration/`)
Test component interactions and full system behavior:
- **System Tests**: End-to-end system lifecycle testing
- **Agent Coordination**: Multi-agent communication testing

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm test tests/unit
```

### Integration Tests Only
```bash
npm test tests/integration
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Specific Test File
```bash
npm test tests/unit/types.test.ts
```

## Test Configuration

Tests are configured via `jest.config.js`:
- **Environment**: Node.js
- **Test Runner**: Jest with TypeScript support
- **Timeout**: 10 seconds for integration tests
- **Coverage**: Statement and branch coverage reporting

## Writing Tests

### Unit Test Example
```typescript
// tests/unit/example.test.ts
import { functionToTest } from '../../src/utils/example';

describe('Example Function', () => {
  test('should return expected result', () => {
    const result = functionToTest('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example
```typescript
// tests/integration/example.integration.test.ts
import System from '../../src/index';

describe('System Integration', () => {
  let system: System;

  beforeEach(() => {
    system = new System();
  });

  afterEach(async () => {
    if (system.isRunning) {
      await system.stop();
    }
  });

  test('should initialize and start', async () => {
    await system.initialize();
    await system.start();
    
    expect(system.isRunning).toBe(true);
  });
});
```

## Test Patterns

### Mocking External Dependencies
```typescript
// Mock external modules
jest.mock('external-module', () => ({
  method: jest.fn(() => 'mocked result')
}));
```

### Async Testing
```typescript
test('async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Error Testing
```typescript
test('should handle errors', async () => {
  await expect(functionThatThrows()).rejects.toThrow('Expected error');
});
```

### Timeout for Long-Running Tests
```typescript
test('long running test', async () => {
  // Test implementation
}, 30000); // 30 second timeout
```

## Coverage Requirements

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Current coverage can be viewed by running:
```bash
npm run test:coverage
```

## Continuous Integration

Tests are automatically run in CI/CD pipelines. All tests must pass before code can be merged.

### Pre-commit Hook
The development setup includes a pre-commit hook that runs:
1. ESLint checks
2. All unit tests
3. Type checking

## Test Data and Fixtures

For tests requiring external data, use:
- Mock data in test files
- Fixtures in `tests/fixtures/` (if needed)
- Environment-specific test configurations

## Debugging Tests

### VS Code Debugging
Use the included VS Code launch configuration:
1. Set breakpoints in test files
2. Run "Debug Tests" configuration
3. Tests will pause at breakpoints

### Debug Specific Test
```bash
node --inspect-brk node_modules/.bin/jest tests/unit/specific.test.ts
```

### Verbose Output
```bash
npm test -- --verbose
```

## Best Practices

### Test Organization
- Group related tests with `describe()` blocks
- Use descriptive test names that explain what is being tested
- Keep tests focused on a single concern

### Test Isolation
- Each test should be independent
- Use `beforeEach()` and `afterEach()` for setup/cleanup
- Don't rely on test execution order

### Assertions
- Use specific matchers for better error messages
- Prefer `toBe()` for primitives, `toEqual()` for objects
- Test both success and failure cases

### Performance
- Keep unit tests fast (< 100ms each)
- Use integration tests for complex scenarios
- Mock expensive operations

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure paths are correct relative to test file
2. **Timeout Errors**: Increase timeout for long-running tests
3. **Mock Issues**: Check that mocks are properly configured
4. **Type Errors**: Ensure test files have proper TypeScript setup

### Getting Help

- Check Jest documentation: https://jestjs.io/docs/getting-started
- Review existing tests for patterns
- Run tests with `--verbose` flag for more details

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Maintain or improve coverage percentage
4. Follow existing test patterns and conventions