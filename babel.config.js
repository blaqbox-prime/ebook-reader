const workletsPluginOptions = {
  // Your custom options.
};

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Required for WatermelonDB decorators
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['react-native-worklets/plugin', workletsPluginOptions],
    ],
  };
};
