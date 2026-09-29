// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.expo/**',
      '*.log',
      '*.lock',
      '*.config.js',
      'metro.config.js',
      'AppEntry.js',
      'babel.config.js',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      '.env',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      '**/*.d.ts',
      '**/__generated__/**',
      '**/ios/**',
      '**/android/**',
    ],
  },
  {
    // Test files live under src/ and are linted, so they need the Jest globals.
    files: [
      'src/**/*.test.{ts,tsx}',
      'src/test/**/*.{ts,tsx}',
      'jest.setup.ts',
    ],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        jest: 'readonly',
        test: 'readonly',
        xdescribe: 'readonly',
        xit: 'readonly',
        xtest: 'readonly',
      },
    },
  },
]);
