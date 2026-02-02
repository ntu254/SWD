const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add resolver to handle react-native-maps and other native modules
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    ...config.resolver?.extraNodeModules,
  },
  // Ensure we're properly resolving native modules
  sourceExts: ["ts", "tsx", "js", "jsx", "json", "cjs"],
};

module.exports = config;
