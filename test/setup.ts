// Test setup file to configure test environment

// Suppress console logs during tests for cleaner output
// You can comment these out if you want to see the logs
global.console = {
  ...console,
  // Keep these for actual test failures
  error: jest.fn(),
  warn: jest.fn(),
  // Optionally suppress info and log as well
  // log: jest.fn(),
  // info: jest.fn(),
};
