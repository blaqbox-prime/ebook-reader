module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
    'import',
    'prettier',
    'simple-import-sort',
    'unused-imports',
    'jsx-a11y',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  env: {
    'react-native/react-native': true,
    node: true,
    es2021: true,
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' },
    ],
    '@typescript-eslint/no-require-imports': 'error',

    // React rules
    'react/prop-types': 'off', // Using TypeScript for props validation
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/jsx-props-no-spreading': 'off',
    'react/display-name': 'off',
    'react/require-default-props': 'off',
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.jsx', '.tsx', '.js', '.ts'] },
    ],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],

    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React Native specific rules
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off', // Can be too restrictive
    'react-native/no-raw-text': ['error', { skip: ['Button', 'Text'] }],

    // Import rules
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{js,jsx,ts,tsx}',
          '**/*.spec.{js,jsx,ts,tsx}',
          '**/test/**',
          '**/__tests__/**',
          '**/*.stories.{js,jsx,ts,tsx}',
          '**/setupTests.{js,jsx,ts,tsx}',
          '**/jest.config.{js,ts}',
          '**/jest.setup.{js,ts}',
        ],
      },
    ],

    // Simple import sort rules
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // React and React Native imports
          ['^react$', '^react-native$', '^react/', '^react-native/'],
          // Other packages
          ['^@?\\w'],
          // Internal imports (aliases)
          ['^@/'],
          // Relative imports
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports
          ['^.+\\.s?css$'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',

    // Unused imports
    'unused-imports/no-unused-imports': 'error',

    // Accessibility rules
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton'],
      },
    ],

    // General ESLint rules
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Using @typescript-eslint/no-unused-vars instead
    'no-undef': 'off', // TypeScript handles this
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'object-shorthand': 'error',
    'quote-props': ['error', 'consistent-as-needed'],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],

    // Prettier integration
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
      { usePrettierrc: true },
    ],
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.test.{js,jsx,ts,tsx}', '*.spec.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
      },
      rules: {
        'react-native/no-inline-styles': 'off',
        'react-native/no-raw-text': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '.expo/',
    '*.config.js',
    '*.config.ts',
    'metro.config.js',
    'AppEntry.js',
    'data/watermelondb/',
  ],
};
