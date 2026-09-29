/**
 * `jest-expo/universal` (the default) is a 4-project config that runs every
 * suite under ios/, android/, web/ and node/ separately. Our logic is
 * deliberately platform-agnostic, so that would quadruple the suite for no
 * gain. `jest-expo/ios` is the single-platform preset; it also matches the
 * `caller.platform: 'ios'` that jest-expo passes to babel, which is what
 * resolves our `module-resolver` `@/` alias and the decorator plugins.
 */
module.exports = {
  preset: 'jest-expo/ios',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  modulePathIgnorePatterns: ['<rootDir>/.expo/', '<rootDir>/dist/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/test/**',
    '!src/**/index.ts',
  ],
  clearMocks: true,
  restoreMocks: true,
  // WatermelonDB's LokiJS adapter leaves its debounced-save timer pending after
  // a suite finishes, so Jest waits forever for the worker to exit. The handle
  // is third-party and fires after all assertions have run, so forcing exit is
  // safe here; the tests themselves still report real pass/fail.
  forceExit: true,
};
