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
]);
