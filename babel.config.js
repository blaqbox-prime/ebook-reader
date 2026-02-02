module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // This ensures the preset doesn't conflict with your custom decorator config
          setPublicClassFields: true,
        },
      ],
      'nativewind/babel',
    ],
    plugins: [
      // 1. Decorators MUST come before class properties
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // 2. This is often required for WatermelonDB + Hermes compatibility
      ['@babel/plugin-transform-class-properties', { loose: true }],
      // 3. Reanimated MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
