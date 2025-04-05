// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure images are handled correctly
config.resolver.assetExts.push('jpg', 'jpeg', 'png', 'svg', 'gif');

module.exports = config; 