// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
    plugins: ['react', 'react-hooks', 'react-native'],
    rules: {
      // React-specific rules
      'react/jsx-uses-react': 'off', // Not needed with React 17+
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      'react/prop-types': 'off', // Disable prop-types as TypeScript is used

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
      'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies

      // React Native rules
      'react-native/no-unused-styles': 'warn', // Warn on unused styles
      'react-native/no-inline-styles': 'warn', // Warn on inline styles
      'react-native/no-color-literals': 'off', // Allow color literals
      'react-native/no-raw-text': 'warn', // Warn on raw text outside Text components

      // General best practices
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Ignore unused vars starting with _
      'no-console': 'warn', // Warn on console logs
    },
  },
]);